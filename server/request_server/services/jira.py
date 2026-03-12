"""Jira integration service for creating and managing tickets."""

import logging
import secrets
import string
from base64 import b64encode
from typing import TYPE_CHECKING

import httpx
from passlib.hash import sha512_crypt  # type: ignore[import-untyped]

from request_server.core.config import settings

if TYPE_CHECKING:
    from request_server.models.artemis_developer_request import ArtemisDeveloperRequest
    from request_server.models.tum_guest_request import TUMGuestRequest
    from request_server.models.vm_access_request import VMAccessRequest
    from request_server.models.vm_request import VMRequest

logger = logging.getLogger(__name__)

# Configure SHA-512 crypt with 5000 rounds
_sha512_hasher = sha512_crypt.using(rounds=5000)


def generate_sha512_password(length: int = 16) -> str:
    """
    Generate a random password and return it as a SHA-512 crypt hash.

    Args:
        length: Length of the random password to generate before hashing.

    Returns:
        SHA-512 crypt hash of a randomly generated password.
    """
    # Generate a random password with letters, digits, and special characters
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = "".join(secrets.choice(alphabet) for _ in range(length))

    # Hash with SHA-512 crypt (5000 rounds)
    return _sha512_hasher.hash(password)


class JiraService:
    """Service for interacting with Jira REST API."""

    def __init__(self) -> None:
        self.base_url = settings.jira_url.rstrip("/")
        self.project_key = settings.jira_project
        self._auth_header = self._create_auth_header()

    def _create_auth_header(self) -> str:
        """Create Basic Auth header from username and API token."""
        credentials = f"{settings.jira_username}:{settings.jira_api_token}"
        encoded = b64encode(credentials.encode()).decode()
        return f"Basic {encoded}"

    def _get_headers(self) -> dict[str, str]:
        """Get headers for Jira API requests."""
        return {
            "Authorization": self._auth_header,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _format_project_details(self, vm_request: "VMRequest") -> str:
        """Format project-specific details based on project type."""
        details = vm_request.project_details
        project_type = vm_request.project_type.value

        if project_type == "ipraktikum":
            return (
                f"*Project Type:* iPraktikum\n"
                f"*Team Name:* {details.get('team_name', 'N/A')}\n"
                f"*Coach Name:* {details.get('coach_name', 'N/A')}"
            )
        elif project_type == "thesis":
            return (
                f"*Project Type:* Thesis\n"
                f"*Study Level:* {details.get('study_level', 'N/A')}\n"
                f"*Supervisor:* {details.get('supervisor', 'N/A')}\n"
                f"*Working Title:* {details.get('working_title', 'N/A')}"
            )
        elif project_type == "chair_project":
            return (
                f"*Project Type:* Chair Project\n"
                f"*Project Name:* {details.get('project_name', 'N/A')}\n"
                f"*Responsible Person:* {details.get('responsible_person', 'N/A')}"
            )
        else:
            return f"*Project Type:* {project_type}\n*Details:* {details}"

    def _format_ports(self, vm_request: "VMRequest") -> str:
        """Format firewall/ports information."""
        lines = [f"*Default Ports Enabled:* {'Yes' if vm_request.default_ports_enabled else 'No'}"]

        if vm_request.additional_ports:
            lines.append("*Additional Ports:*")
            for port_info in vm_request.additional_ports:
                port = port_info.get("port", "N/A")
                protocol = port_info.get("protocol", "tcp")
                reason = port_info.get("reason", "No reason provided")
                lines.append(f"  - {port}/{protocol}: {reason}")
        else:
            lines.append("*Additional Ports:* None")

        return "\n".join(lines)

    def _format_users(self, vm_request: "VMRequest") -> str:
        """Format additional users information."""
        if vm_request.additional_users:
            users_list = ", ".join(vm_request.additional_users)
            return f"*Additional Users:* {users_list}"
        return "*Additional Users:* None"

    def _format_ssh_key(self, vm_request: "VMRequest") -> str:
        """Format SSH key information."""
        if vm_request.ssh_key_type == "existing":
            return f"*SSH Key:* Using existing key (ID: {vm_request.ssh_key_value})"
        elif vm_request.ssh_key_type == "new":
            # Truncate the key for display
            key_preview = (
                vm_request.ssh_key_value[:50] + "..." if vm_request.ssh_key_value else "N/A"
            )
            return f"*SSH Key:* New key provided\n{{code}}{key_preview}{{code}}"
        else:
            return f"*SSH Key Type:* {vm_request.ssh_key_type}"

    def _format_account_info(self, vm_request: "VMRequest", public_key: str | None = None) -> str:
        """Format account information for the requester in an easily copyable format."""
        return (
            f"{{{{{vm_request.requester_username}:}}}}\n"
            f"\t{{{{name: {vm_request.requester_name or 'N/A'}}}}}\n"
            f"\t{{{{email: {vm_request.requester_email or 'N/A'}}}}}\n"
            f"\t{{{{pk: {public_key or 'N/A'}}}}}\n"
            f"\t{{{{pw: {generate_sha512_password()}}}}}\n"
        )

    def build_description(self, vm_request: "VMRequest", public_key: str | None = None) -> str:
        """Build a well-formatted Jira description from a VM request."""
        sections = [
            "h2. VM Request Details",
            "",
            "h3. Requester Information",
            f"*Username:* {vm_request.requester_username}",
            f"*Name:* {vm_request.requester_name or 'N/A'}",
            f"*Email:* {vm_request.requester_email or 'N/A'}",
            "",
            "h3. VM Configuration",
            f"*Hostname:* {vm_request.hostname}",
            f"*Description:* {vm_request.description}",
            f"*CPU Cores:* {vm_request.cpu_cores}",
            f"*RAM:* {vm_request.ram_gb} GB",
        ]

        # Add resource justification if extra resources requested
        if vm_request.cpu_cores > 4 or vm_request.ram_gb > 4:
            justification = vm_request.resource_justification or "No justification provided"
            sections.append(f"*Resource Justification:* {justification}")

        sections.extend(
            [
                "",
                "h3. Project Information",
                self._format_project_details(vm_request),
                "",
                "h3. Network Configuration",
                self._format_ports(vm_request),
                "",
                "h3. Access Configuration",
                self._format_users(vm_request),
                self._format_ssh_key(vm_request),
            ]
        )

        # Add additional comments if present
        if vm_request.additional_comments:
            sections.extend(
                [
                    "",
                    "h3. Additional Comments",
                    vm_request.additional_comments,
                ]
            )

        # Add account info section for easy copy-paste
        sections.extend(
            [
                "",
                "h3. Account Info",
                self._format_account_info(vm_request, public_key),
            ]
        )

        sections.extend(
            [
                "",
                "----",
                f"_Request ID: {vm_request.id}_",
                f"_Created: {vm_request.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}_",
            ]
        )

        return "\n".join(sections)

    def build_summary(self, vm_request: "VMRequest") -> str:
        """Build the issue summary/title."""
        return f"[VM Request] {vm_request.hostname} - {vm_request.requester_username}"

    async def create_ticket(
        self, vm_request: "VMRequest", public_key: str | None = None
    ) -> str | None:
        """
        Create a Jira ticket for a VM request.

        Args:
            vm_request: The VM request model.
            public_key: The SSH public key to include in the account info section.

        Returns the ticket key (e.g., "RA2T-123") or None if creation failed.
        """
        if not settings.jira_enabled:
            logger.warning("Jira integration is not configured, skipping ticket creation")
            return None

        # Build the issue payload
        # Reporter is set using the username directly since all users
        # authenticate via Keycloak which is connected to Jira's identity system
        issue_data = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": self.build_summary(vm_request),
                "description": self.build_description(vm_request, public_key),
                "issuetype": {"name": "Task"},
                "reporter": {"name": vm_request.requester_username},
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rest/api/2/issue",
                    json=issue_data,
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                result = response.json()
                ticket_key = result.get("key")
                logger.info(f"Created Jira ticket {ticket_key} for VM request {vm_request.id}")

                if ticket_key:
                    # Set the secondary reporter (customfield_12200) to the service account
                    await self._set_secondary_reporter(client, ticket_key)

                    # Add a welcome comment with useful information
                    await self.add_welcome_comment(ticket_key, vm_request)

                return ticket_key

            except httpx.HTTPStatusError as e:
                logger.error(
                    f"Failed to create Jira ticket: {e.response.status_code} - {e.response.text}"
                )
                return None
            except httpx.HTTPError as e:
                logger.error(f"Failed to create Jira ticket: {e}")
                return None

    async def _set_secondary_reporter(self, client: httpx.AsyncClient, ticket_key: str) -> bool:
        """Set the secondary reporter custom field to the service account."""
        try:
            # Update the ticket to set customfield_12200 (secondary reporter) to the
            # requestaccess service account to indicate this issue came from the system
            update_data = {"fields": {"customfield_12200": {"name": settings.jira_username}}}
            response = await client.put(
                f"{self.base_url}/rest/api/2/issue/{ticket_key}",
                json=update_data,
                headers=self._get_headers(),
            )
            response.raise_for_status()
            logger.info(f"Set secondary reporter for ticket {ticket_key}")
            return True
        except httpx.HTTPError as e:
            logger.warning(f"Failed to set secondary reporter for ticket {ticket_key}: {e}")
            return False

    async def add_welcome_comment(self, ticket_key: str, vm_request: "VMRequest") -> bool:
        """Add a welcome comment to the ticket with useful information for the requester."""
        comment_body = (
            f"Hello [~{vm_request.requester_username}],\n\n"
            f"Your VM request for *{vm_request.hostname}* has been received and is being processed.\n\n"
            f"*What happens next:*\n"
            f"# Our team will review your request\n"
            f"# If approved, the VM will be provisioned\n"
            f"# You will have access via SSH using the provided credentials (SSH-Pub-Key)\n\n"
            f"*Estimated timeline:* 1-3 business days\n\n"
            f"If you have any questions, please comment on this ticket or contact the AET team.\n\n"
            f"----\n"
            f"_This comment was automatically generated by the AET Request System._"
        )

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rest/api/2/issue/{ticket_key}/comment",
                    json={"body": comment_body},
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                logger.info(f"Added welcome comment to ticket {ticket_key}")
                return True
            except httpx.HTTPError as e:
                logger.warning(f"Failed to add comment to ticket {ticket_key}: {e}")
                return False

    async def update_ticket_status(self, ticket_key: str, status: str) -> bool:
        """Update the status of a Jira ticket (for future use)."""
        # This would require knowing the transition IDs for your Jira workflow
        # Left as a placeholder for future implementation
        logger.info(f"Would update ticket {ticket_key} to status {status}")
        return True

    # ========== VM Access Request Methods ==========

    def _format_access_ssh_key(self, access_request: "VMAccessRequest") -> str:
        """Format SSH key information for access request."""
        if access_request.ssh_key_type == "existing":
            return f"*SSH Key:* Using existing key (ID: {access_request.ssh_key_value})"
        elif access_request.ssh_key_type == "new":
            # Truncate the key for display
            key_preview = (
                access_request.ssh_key_value[:50] + "..." if access_request.ssh_key_value else "N/A"
            )
            return f"*SSH Key:* New key provided\n{{code}}{key_preview}{{code}}"
        else:
            return f"*SSH Key Type:* {access_request.ssh_key_type}"

    def _format_access_account_info(
        self, access_request: "VMAccessRequest", public_key: str | None = None
    ) -> str:
        """Format account information for the access requester in an easily copyable format."""
        return (
            f"{{{{{access_request.requester_username}:}}}}\n"
            f"\t{{{{name: {access_request.requester_name or 'N/A'}}}}}\n"
            f"\t{{{{email: {access_request.requester_email or 'N/A'}}}}}\n"
            f"\t{{{{pk: {public_key or 'N/A'}}}}}\n"
            f"\t{{{{pw: {generate_sha512_password()}}}}}\n"
        )

    def build_access_request_description(
        self, access_request: "VMAccessRequest", public_key: str | None = None
    ) -> str:
        """Build a well-formatted Jira description from a VM access request."""
        sections = [
            "h2. VM Access Request Details",
            "",
            "h3. Requester Information",
            f"*Username:* {access_request.requester_username}",
            f"*Name:* {access_request.requester_name or 'N/A'}",
            f"*Email:* {access_request.requester_email or 'N/A'}",
            "",
            "h3. Target VM",
            f"*Hostname:* {access_request.hostname}",
            "",
            "h3. Request Details",
            "*Justification:*",
            access_request.justification,
        ]

        if access_request.contact_person:
            sections.extend(
                [
                    "",
                    f"*Contact Person:* {access_request.contact_person}",
                ]
            )

        # Add account info section for easy copy-paste
        sections.extend(
            [
                "",
                "h3. Account Info",
                self._format_access_account_info(access_request, public_key),
            ]
        )

        sections.extend(
            [
                "",
                "----",
                f"_Request ID: {access_request.id}_",
                f"_Created: {access_request.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}_",
            ]
        )

        return "\n".join(sections)

    def build_access_request_summary(self, access_request: "VMAccessRequest") -> str:
        """Build the issue summary/title for access request."""
        return f"[VM Access] {access_request.hostname} - {access_request.requester_username}"

    async def create_access_request_ticket(
        self, access_request: "VMAccessRequest", public_key: str | None = None
    ) -> str | None:
        """
        Create a Jira ticket for a VM access request.

        Args:
            access_request: The VM access request model.
            public_key: The SSH public key to include in the account info section.

        Returns the ticket key (e.g., "RA2T-123") or None if creation failed.
        """
        if not settings.jira_enabled:
            logger.warning("Jira integration is not configured, skipping ticket creation")
            return None

        issue_data = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": self.build_access_request_summary(access_request),
                "description": self.build_access_request_description(access_request, public_key),
                "issuetype": {"name": "Task"},
                "reporter": {"name": access_request.requester_username},
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rest/api/2/issue",
                    json=issue_data,
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                result = response.json()
                ticket_key = result.get("key")
                logger.info(
                    f"Created Jira ticket {ticket_key} for VM access request {access_request.id}"
                )

                if ticket_key:
                    # Set the secondary reporter to the service account
                    await self._set_secondary_reporter(client, ticket_key)

                    # Add a welcome comment
                    await self._add_access_request_comment(client, ticket_key, access_request)

                return ticket_key

            except httpx.HTTPStatusError as e:
                logger.error(
                    f"Failed to create Jira ticket: {e.response.status_code} - {e.response.text}"
                )
                return None
            except httpx.HTTPError as e:
                logger.error(f"Failed to create Jira ticket: {e}")
                return None

    async def _add_access_request_comment(
        self,
        client: httpx.AsyncClient,
        ticket_key: str,
        access_request: "VMAccessRequest",
    ) -> bool:
        """Add a welcome comment to the access request ticket."""
        comment_body = (
            f"Hello [~{access_request.requester_username}],\n\n"
            f"Your request for access to *{access_request.hostname}* has been received.\n\n"
            f"*What happens next:*\n"
            f"# Our team will verify your request with the VM owner/contact person\n"
            f"# If approved, your SSH key will be added to the VM\n"
            f"# You will be notified once access has been granted\n\n"
            f"*Estimated timeline:* 1-3 business days\n\n"
            f"If you have any questions, please comment on this ticket or contact the AET team.\n\n"
            f"----\n"
            f"_This comment was automatically generated by the AET Request System._"
        )

        try:
            response = await client.post(
                f"{self.base_url}/rest/api/2/issue/{ticket_key}/comment",
                json={"body": comment_body},
                headers=self._get_headers(),
            )
            response.raise_for_status()
            logger.info(f"Added welcome comment to access request ticket {ticket_key}")
            return True
        except httpx.HTTPError as e:
            logger.warning(f"Failed to add comment to ticket {ticket_key}: {e}")
            return False

    # ========== TUM Guest Account Request Methods ==========

    def _format_guest_type_details(self, guest_request: "TUMGuestRequest") -> str:
        """Format guest type specific details."""
        details = guest_request.guest_type_details
        guest_type = guest_request.guest_type.value

        if guest_type == "ipraktikum-customer":
            return (
                f"*Guest Type:* iPraktikum Customer\n"
                f"*Team Name:* {details.get('team_name', 'N/A')}\n"
                f"*Coach/PL Name:* {details.get('coach_name', 'N/A')}"
            )
        elif guest_type == "artemis":
            return (
                f"*Guest Type:* Artemis\n"
                f"*University/Company:* {details.get('university_or_company', 'N/A')}"
            )
        elif guest_type == "other":
            return f"*Guest Type:* Other\n*Reason:* {details.get('reason', 'N/A')}"
        else:
            return f"*Guest Type:* {guest_type}"

    def _format_gender(self, gender_value: str) -> str:
        """Format gender for display."""
        gender_map = {"male": "Male", "female": "Female", "diverse": "Diverse"}
        return gender_map.get(gender_value, gender_value)

    def build_guest_request_description(
        self,
        guest_request: "TUMGuestRequest",
        is_authenticated: bool,
    ) -> str:
        """Build a well-formatted Jira description from a TUM guest request."""
        sections = [
            "h2. TUM Guest Account Request",
            "",
        ]

        # Highlight if this is an anonymous request
        if not is_authenticated:
            sections.extend(
                [
                    "{panel:bgColor=#ffffcc}",
                    "*NOTICE:* This request was submitted by an *anonymous user* (not logged in).",
                    "Please verify the contact person and request details carefully.",
                    "{panel}",
                    "",
                ]
            )

        # Requester/Submitter info
        sections.append("h3. Request Submitted By")
        if is_authenticated:
            sections.extend(
                [
                    f"*Username:* {guest_request.requester_username}",
                    f"*Name:* {guest_request.requester_name or 'N/A'}",
                    f"*Email:* {guest_request.requester_email or 'N/A'}",
                    "_This user is requesting a guest account for someone else._",
                ]
            )
        else:
            if guest_request.requesting_for_self:
                sections.append("_Anonymous user requesting account for themselves._")
            else:
                sections.append("_Anonymous user requesting account for someone else._")
            sections.append(f"*Contact Person at TUM:* {guest_request.contact_person or 'N/A'}")

        # Guest personal information
        sections.extend(
            [
                "",
                "h3. Guest Information",
                f"*First Name:* {guest_request.guest_first_name}",
                f"*Last Name:* {guest_request.guest_last_name}",
                f"*Email:* {guest_request.guest_email}",
                f"*Date of Birth:* {guest_request.guest_birth_date.strftime('%Y-%m-%d')}",
                f"*Gender:* {self._format_gender(guest_request.guest_gender.value)}",
                f"*Nationality:* {guest_request.guest_nationality}",
            ]
        )

        # Guest type details
        sections.extend(
            [
                "",
                "h3. Request Type",
                self._format_guest_type_details(guest_request),
            ]
        )

        # Additional comments
        if guest_request.additional_comments:
            sections.extend(
                [
                    "",
                    "h3. Additional Comments",
                    guest_request.additional_comments,
                ]
            )

        sections.extend(
            [
                "",
                "----",
                f"_Request ID: {guest_request.id}_",
                f"_Created: {guest_request.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}_",
            ]
        )

        return "\n".join(sections)

    def build_guest_request_summary(
        self, guest_request: "TUMGuestRequest", is_authenticated: bool
    ) -> str:
        """Build the issue summary/title for guest request."""
        guest_name = f"{guest_request.guest_first_name} {guest_request.guest_last_name}"
        if is_authenticated:
            return f"[TUM Guest] {guest_name} (requested by {guest_request.requester_username})"
        else:
            return f"[TUM Guest] {guest_name} (anonymous request)"

    async def create_guest_request_ticket(
        self,
        guest_request: "TUMGuestRequest",
        is_authenticated: bool,
        requester_username: str | None = None,
    ) -> str | None:
        """
        Create a Jira ticket for a TUM guest account request.

        Args:
            guest_request: The TUM guest request model.
            is_authenticated: Whether the request was made by an authenticated user.
            requester_username: Username of the requester (if authenticated).

        Returns the ticket key (e.g., "RA2T-123") or None if creation failed.
        """
        if not settings.jira_enabled:
            logger.warning("Jira integration is not configured, skipping ticket creation")
            return None

        # Build the issue payload
        issue_data: dict = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": self.build_guest_request_summary(guest_request, is_authenticated),
                "description": self.build_guest_request_description(
                    guest_request, is_authenticated
                ),
                "issuetype": {"name": "Task"},
            }
        }

        # Only set reporter if authenticated (anonymous users can't be reporters)
        if is_authenticated and requester_username:
            issue_data["fields"]["reporter"] = {"name": requester_username}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rest/api/2/issue",
                    json=issue_data,
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                result = response.json()
                ticket_key = result.get("key")
                logger.info(
                    f"Created Jira ticket {ticket_key} for TUM guest request {guest_request.id}"
                )

                if ticket_key:
                    # Set the secondary reporter to the service account
                    await self._set_secondary_reporter(client, ticket_key)

                    # Add a welcome comment with next steps
                    await self._add_guest_request_comment(
                        client,
                        ticket_key,
                        guest_request,
                        is_authenticated,
                        requester_username,
                    )

                return ticket_key

            except httpx.HTTPStatusError as e:
                logger.error(
                    f"Failed to create Jira ticket: {e.response.status_code} - {e.response.text}"
                )
                return None
            except httpx.HTTPError as e:
                logger.error(f"Failed to create Jira ticket: {e}")
                return None

    async def _add_guest_request_comment(
        self,
        client: httpx.AsyncClient,
        ticket_key: str,
        guest_request: "TUMGuestRequest",
        is_authenticated: bool,
        requester_username: str | None,
    ) -> bool:
        """Add a welcome comment to the guest request ticket with next steps."""
        guest_name = f"{guest_request.guest_first_name} {guest_request.guest_last_name}"

        if is_authenticated and requester_username:
            # Comment for authenticated users (requesting for someone else)
            comment_body = (
                f"Hello [~{requester_username}],\n\n"
                f"Your TUM guest account request for *{guest_name}* has been received.\n\n"
                f"*What happens next:*\n"
                f"# We will create the account - this may take a few days as manual intervention is required\n"
                f"# The guest ({guest_request.guest_email}) will receive an email with a PIN code\n"
                f"# They must activate their account within 7 days of receiving the PIN\n"
                f"# They will set a secure password in TUMonline during activation\n"
                f"# Once activated, they can log in to all our systems using their new TUMID and password\n\n"
                f"If you encounter problems, please reach out to ls1.admin@in.tum.de.\n\n"
                f"----\n"
                f"_This comment was automatically generated by the AET Request System._"
            )
        else:
            # Comment for anonymous requests
            if guest_request.requesting_for_self:
                # User requesting for themselves
                comment_body = (
                    f"Hello,\n\n"
                    f"Your TUM guest account request has been received.\n\n"
                    f"*What happens next:*\n"
                    f"# You will receive an email confirming your request to {guest_request.guest_email}\n"
                    f"# We will create the account for you - this may take a few days as manual intervention is required\n"
                    f"# You will receive an email with a PIN code to the address you supplied in this form\n"
                    f"# Please make sure to activate your account within 7 days of receiving the PIN\n"
                    f"# Set a secure password in TUMonline (you will be prompted to do so)\n"
                    f"# You can then log in to all our systems using your new TUMID (e.g. ga12xyz) and the password you set\n\n"
                    f"If you encounter problems, please reach out to ls1.admin@in.tum.de.\n\n"
                    f"----\n"
                    f"_This comment was automatically generated by the AET Request System._"
                )
            else:
                # Anonymous user requesting for someone else
                comment_body = (
                    f"Hello,\n\n"
                    f"A TUM guest account request for *{guest_name}* has been received.\n\n"
                    f"*What happens next:*\n"
                    f"# We will verify this request with the contact person at TUM\n"
                    f"# If approved, we will create the account - this may take a few days as manual intervention is required\n"
                    f"# The guest ({guest_request.guest_email}) will receive an email with a PIN code\n"
                    f"# They must activate their account within 7 days of receiving the PIN\n"
                    f"# They will set a secure password in TUMonline during activation\n"
                    f"# Once activated, they can log in to all our systems using their new TUMID and password\n\n"
                    f"If you encounter problems, please reach out to ls1.admin@in.tum.de.\n\n"
                    f"----\n"
                    f"_This comment was automatically generated by the AET Request System._"
                )

        try:
            response = await client.post(
                f"{self.base_url}/rest/api/2/issue/{ticket_key}/comment",
                json={"body": comment_body},
                headers=self._get_headers(),
            )
            response.raise_for_status()
            logger.info(f"Added welcome comment to guest request ticket {ticket_key}")
            return True
        except httpx.HTTPError as e:
            logger.warning(f"Failed to add comment to ticket {ticket_key}: {e}")
            return False

    # ========== Artemis Developer Request Methods ==========

    def _format_subteams(self, subteams: list[str], other_subteam: str | None) -> str:
        """Format subteams list for display."""
        formatted = []
        for team in subteams:
            if team == "other" and other_subteam:
                formatted.append(f"Other ({other_subteam})")
            else:
                # Capitalize team names nicely
                team_display = team.replace("-", " ").title()
                if team == "lti":
                    team_display = "LTI"
                formatted.append(team_display)
        return ", ".join(formatted)

    def _format_subteams_csv(self, subteams: list[str], other_subteam: str | None) -> str:
        """Format subteams as CSV string for import line - uppercase first char, comma-separated in quotes."""
        formatted = []
        for team in subteams:
            if team == "other" and other_subteam:
                # Capitalize first letter of custom subteam
                formatted.append(other_subteam.capitalize())
            else:
                # Capitalize first letter of each team
                formatted.append(team.capitalize())
        return '"' + ",".join(formatted) + '"'

    def _get_requester_display_name(
        self,
        artemis_request: "ArtemisDeveloperRequest",
        is_authenticated: bool,
    ) -> str:
        """Get display name for the requester."""
        if is_authenticated:
            return artemis_request.requester_name or artemis_request.requester_username or "Unknown"
        return artemis_request.anonymous_name or "Unknown"

    def _get_requester_email(
        self,
        artemis_request: "ArtemisDeveloperRequest",
        is_authenticated: bool,
    ) -> str:
        """Get email for the requester."""
        if is_authenticated:
            return artemis_request.requester_email or ""
        return artemis_request.anonymous_email or ""

    def _get_requester_tumid(
        self,
        artemis_request: "ArtemisDeveloperRequest",
        is_authenticated: bool,
    ) -> str:
        """Get TUM ID for the requester (username for authenticated, empty for anonymous)."""
        if is_authenticated:
            return artemis_request.requester_username or ""
        return ""

    def build_artemis_request_description(
        self,
        artemis_request: "ArtemisDeveloperRequest",
        is_authenticated: bool,
    ) -> str:
        """Build a well-formatted Jira description from an Artemis developer request."""
        sections = [
            "h2. Artemis Developer Access Request",
            "",
        ]

        # Highlight if this is an anonymous request
        if not is_authenticated:
            sections.extend(
                [
                    "{panel:bgColor=#ffffcc}",
                    "*NOTICE:* This request was submitted by an *anonymous user* (not logged in).",
                    "Please verify the request details carefully.",
                    "{panel}",
                    "",
                ]
            )

        # Requester info
        sections.append("h3. Requester Information")
        if is_authenticated:
            sections.extend(
                [
                    f"*TUM Username:* {artemis_request.requester_username}",
                    f"*Name:* {artemis_request.requester_name or 'N/A'}",
                    f"*Email:* {artemis_request.requester_email or 'N/A'}",
                ]
            )
        else:
            sections.extend(
                [
                    f"*Name:* {artemis_request.anonymous_name}",
                    f"*Email:* {artemis_request.anonymous_email}",
                    "_This user does not have a TUM account._",
                ]
            )

        # GitHub info with verification badge and profile picture
        sections.extend(
            [
                "",
                "h3. GitHub Profile",
            ]
        )

        # Add GitHub avatar if available
        if artemis_request.github_avatar_url:
            sections.append(f"!{artemis_request.github_avatar_url}|width=64,height=64!")

        sections.extend(
            [
                f"*GitHub Username:* [{artemis_request.github_username}|{artemis_request.github_profile_url or f'https://github.com/{artemis_request.github_username}'}]",
            ]
        )

        if artemis_request.github_name:
            sections.append(f"*GitHub Display Name:* {artemis_request.github_name}")

        # Verification status
        sections.append("*Profile Verified:* (/) Yes - GitHub profile exists and was verified")

        # Artemis details
        sections.extend(
            [
                "",
                "h3. Artemis Team Details",
                f"*Slack Email:* {artemis_request.slack_email}",
                f"*Contact Person:* {artemis_request.contact_person}",
                f"*Advisor:* {artemis_request.advisor}",
                f"*Subteams:* {self._format_subteams(artemis_request.subteams, artemis_request.other_subteam)}",
            ]
        )

        # Additional comments
        if artemis_request.additional_comments:
            sections.extend(
                [
                    "",
                    "h3. Additional Comments",
                    artemis_request.additional_comments,
                ]
            )

        # CSV import line
        requester_name = self._get_requester_display_name(artemis_request, is_authenticated)
        name_parts = requester_name.split(" ", 1)
        first_name = name_parts[0] if name_parts else ""
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        tumid = self._get_requester_tumid(artemis_request, is_authenticated)
        email = self._get_requester_email(artemis_request, is_authenticated)
        csv_teams = self._format_subteams_csv(
            artemis_request.subteams, artemis_request.other_subteam
        )

        sections.extend(
            [
                "",
                "h3. CSV Import Line",
                "{noformat}"
                + f"{tumid},{first_name},{last_name},{email},{artemis_request.github_username},{artemis_request.slack_email},{csv_teams},False,False,False,True,False,False,False,False,False,False,False"
                + "{noformat}",
            ]
        )

        sections.extend(
            [
                "",
                "----",
                f"_Request ID: {artemis_request.id}_",
                f"_Created: {artemis_request.created_at.strftime('%Y-%m-%d %H:%M:%S UTC')}_",
            ]
        )

        return "\n".join(sections)

    def build_artemis_request_summary(
        self, artemis_request: "ArtemisDeveloperRequest", is_authenticated: bool
    ) -> str:
        """Build the issue summary/title for Artemis developer request."""
        if is_authenticated:
            return f"[Artemis Dev] {artemis_request.github_username} - {artemis_request.requester_username}"
        else:
            return f"[Artemis Dev] {artemis_request.github_username} (anonymous: {artemis_request.anonymous_name})"

    async def create_artemis_developer_request_ticket(
        self,
        artemis_request: "ArtemisDeveloperRequest",
        is_authenticated: bool,
        requester_username: str | None = None,
    ) -> str | None:
        """
        Create a Jira ticket for an Artemis developer access request.

        Args:
            artemis_request: The Artemis developer request model.
            is_authenticated: Whether the request was made by an authenticated user.
            requester_username: Username of the requester (if authenticated).

        Returns the ticket key (e.g., "RA2T-123") or None if creation failed.
        """
        if not settings.jira_enabled:
            logger.warning("Jira integration is not configured, skipping ticket creation")
            return None

        # Build the issue payload
        issue_data: dict = {
            "fields": {
                "project": {"key": self.project_key},
                "summary": self.build_artemis_request_summary(artemis_request, is_authenticated),
                "description": self.build_artemis_request_description(
                    artemis_request, is_authenticated
                ),
                "issuetype": {"name": "Task"},
            }
        }

        # Only set reporter if authenticated (anonymous users can't be reporters)
        if is_authenticated and requester_username:
            issue_data["fields"]["reporter"] = {"name": requester_username}

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.base_url}/rest/api/2/issue",
                    json=issue_data,
                    headers=self._get_headers(),
                )
                response.raise_for_status()
                result = response.json()
                ticket_key = result.get("key")
                logger.info(
                    f"Created Jira ticket {ticket_key} for Artemis developer request {artemis_request.id}"
                )

                if ticket_key:
                    # Set the secondary reporter to the service account
                    await self._set_secondary_reporter(client, ticket_key)

                    # Add a welcome comment with next steps
                    await self._add_artemis_request_comment(
                        client,
                        ticket_key,
                        artemis_request,
                        is_authenticated,
                        requester_username,
                    )

                return ticket_key

            except httpx.HTTPStatusError as e:
                logger.error(
                    f"Failed to create Jira ticket: {e.response.status_code} - {e.response.text}"
                )
                return None
            except httpx.HTTPError as e:
                logger.error(f"Failed to create Jira ticket: {e}")
                return None

    async def _add_artemis_request_comment(
        self,
        client: httpx.AsyncClient,
        ticket_key: str,
        artemis_request: "ArtemisDeveloperRequest",
        is_authenticated: bool,
        requester_username: str | None,
    ) -> bool:
        """Add a welcome comment to the Artemis request ticket with next steps."""
        if is_authenticated and requester_username:
            # Comment for authenticated users
            comment_body = (
                f"Hello [~{requester_username}],\n\n"
                f"Your Artemis developer access request has been received.\n\n"
                f"*What happens next:*\n"
                f"# Our team will review your request\n"
                f"# If approved, you will be granted access to the Artemis development resources\n"
                f"# You will be notified once access has been granted\n\n"
                f"*Once approved, you will have access to:*\n"
                f"* Confluence and Bamboo\n"
                f"* The Artemis test servers\n"
                f"* [GitHub|https://github.com/ls1intum]\n"
                f"* Slack channels (invitation will be sent to {artemis_request.slack_email})\n"
                f"* [Grafana|https://grafana.monitoring.aet.cit.tum.de/] for logs and monitoring of the test servers (select Keycloak for login)\n\n"
                f"If you have any questions, please comment on this ticket or contact the AET team.\n\n"
                f"----\n"
                f"_This comment was automatically generated by the AET Request System._"
            )
        else:
            # Comment for anonymous requests
            comment_body = (
                f"Hello,\n\n"
                f"An Artemis developer access request for *{artemis_request.anonymous_name}* has been received.\n\n"
                f"*What happens next:*\n"
                f"# Our team will review your request\n"
                f"# If approved, access to the Artemis development resources will be granted\n"
                f"# You will be notified at {artemis_request.anonymous_email} once access has been granted\n\n"
                f"*Once approved, the following resources will be accessible:*\n"
                f"* Confluence and Bamboo\n"
                f"* The Artemis test servers\n"
                f"* [GitHub|https://github.com/ls1intum]\n"
                f"* Slack channels (invitation will be sent to {artemis_request.slack_email})\n"
                f"* [Grafana|https://grafana.monitoring.aet.cit.tum.de/] for logs and monitoring of the test servers (select Keycloak for login)\n\n"
                f"If you have any questions, please reach out to the AET team.\n\n"
                f"----\n"
                f"_This comment was automatically generated by the AET Request System._"
            )

        try:
            response = await client.post(
                f"{self.base_url}/rest/api/2/issue/{ticket_key}/comment",
                json={"body": comment_body},
                headers=self._get_headers(),
            )
            response.raise_for_status()
            logger.info(f"Added welcome comment to Artemis request ticket {ticket_key}")
            return True
        except httpx.HTTPError as e:
            logger.warning(f"Failed to add comment to ticket {ticket_key}: {e}")
            return False


# Singleton instance
jira_service = JiraService()
