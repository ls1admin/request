from fastapi import APIRouter

from request_server.api.routes import (
    artemis_developer_requests,
    ssh_keys,
    support_requests,
    tum_guest_requests,
    vm_access_requests,
    vm_requests,
)
from request_server.core.config import settings

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(vm_requests.router)
api_router.include_router(vm_access_requests.router)
api_router.include_router(tum_guest_requests.router)
api_router.include_router(artemis_developer_requests.router)
api_router.include_router(support_requests.router)
api_router.include_router(ssh_keys.router)

if settings.ticket_system == "debug":
    from request_server.api.routes.debug import router as debug_router

    api_router.include_router(debug_router)
