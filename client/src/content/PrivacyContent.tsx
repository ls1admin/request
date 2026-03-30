export function PrivacyContent() {
  return (
    <>
      <p className="mb-4">
        The Research Group for Applied Education Technologies (referred to as
        AET in the following paragraphs) from the Technical University of Munich
        takes the protection of private data seriously. We process personal data
        in compliance with applicable data protection regulations, in
        particular:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>The General Data Protection Regulation (GDPR)</li>
        <li>
          The Bavarian Data Protection Act (BayDSG), which applies to public
          institutions in Bavaria
        </li>
      </ul>

      <p className="mb-4">
        Below, we inform you about the type, scope and purpose of the collection
        and use of personal data.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">Data we collect</h3>

      <p className="mb-4">
        This application collects and processes personal data that you provide
        when submitting resource requests. Depending on the type of request,
        this may include:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>
          <strong>Authentication data:</strong> When you log in via TUM&apos;s
          identity provider (Keycloak), we receive your name, email address, and
          TUM username.
        </li>
        <li>
          <strong>VM Request data:</strong> Hostname, project details (team
          name, thesis title, project name, responsible person), SSH public
          keys, and usernames of additional users.
        </li>
        <li>
          <strong>VM Access Request data:</strong> Target hostname,
          justification, contact person, and SSH public keys.
        </li>
        <li>
          <strong>Artemis Developer Request data:</strong> Name, email addresses
          (main and Slack), GitHub username and profile information (avatar,
          profile URL, and display name), contact person, advisor, and subteam
          assignments. For Artemis requests, the entered GitHub username is
          checked against GitHub&apos;s public API.
        </li>
        <li>
          <strong>TUM Guest Account Request data:</strong> First name, last
          name, email address, date of birth, gender, nationality, contact
          person at TUM, and purpose of the guest account.
        </li>
      </ul>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Purpose of data processing
      </h3>

      <p className="mb-4">
        We process your personal data for the following purposes:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>
          Processing and fulfilling your resource requests (virtual machines,
          access permissions, guest accounts, developer access)
        </li>
        <li>
          Creating and managing support tickets in our issue tracking system
        </li>
        <li>Contacting you regarding the status of your requests</li>
        <li>Managing access to university systems and infrastructure</li>
        <li>Maintaining audit logs for security and compliance purposes</li>
      </ul>

      <h3 className="text-lg font-medium mb-2 mt-6">Legal basis</h3>

      <p className="mb-4">
        The legal basis for processing your request data is Art. 6(1) lit. e
        GDPR in conjunction with the applicable provisions of Bavarian data
        protection law for public bodies. As part of the Technical University
        of Munich, AET processes personal data insofar as this is necessary for
        the performance of tasks carried out in the public interest, in
        particular for the provision and administration of university IT
        resources, access rights, accounts, and related support processes.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">Data retention</h3>

      <p className="mb-4">
        Your request data is automatically deleted one year (365 days) after
        submission. SSH keys stored in your account are retained for as long as
        your account exists, as they are reusable across requests. Tickets
        created in our issue tracking system are subject to the retention
        policies of that system. You may request earlier deletion of your data
        at any time by contacting us (see below).
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">Data recipients</h3>

      <p className="mb-4">Your data may be shared with:</p>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>AET staff members responsible for processing your request</li>
        <li>System administrators who provision the requested resources</li>
        <li>
          Our issue tracking system Redmine for request management, ticket
          attribution, and communication
        </li>
        <li>
          For authenticated requests, Redmine may receive your username, name,
          and email address in order to create or provision a user account and
          assign the ticket to you correctly
        </li>
      </ul>

      <h3 className="text-lg font-medium mb-2 mt-6">Logging</h3>

      <p className="mb-4">
        The web servers of the AET are operated by the AET itself, based in
        Boltzmannstr. 3, 85748 Garching b. Munich. Every time our website is
        accessed, the web server temporarily processes the following information
        in log files:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>IP address of the requesting computer</li>
        <li>Date and time of access</li>
        <li>Name, URL and transferred data volume of the retrieved file</li>
        <li>Access status (requested file transferred, not found, etc.)</li>
        <li>
          Identification data of the browser and operating system used (if
          transmitted by the requesting web browser)
        </li>
        <li>
          Web page from which access was made (if transmitted by the requesting
          web browser)
        </li>
      </ul>

      <p className="mb-4">
        The processing of the data in this log file takes place as follows:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>
          The log entries are continuously and automatically evaluated in order
          to be able to detect attacks on the web server and react accordingly.
        </li>
        <li>
          In individual cases, i.e. in the case of reported disruptions, errors
          and security incidents, a manual analysis is carried out.
        </li>
      </ul>

      <p className="mb-4">
        The IP addresses contained in the log entries are not merged with other
        databases by AET, so that no conclusions can be drawn about individual
        persons.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Cookies and browser storage
      </h3>

      <p className="mb-4">
        This application uses technically necessary mechanisms in your browser
        to provide core functionality. When you use the personal login via
        Keycloak, technically necessary authentication data may be processed by
        means of cookies and browser session storage in order to complete the
        login, maintain your authenticated session, and securely return you to
        this application.
      </p>

      <p className="mb-4">
        In addition, this application stores technically necessary information
        in local browser storage only where required for operation:
      </p>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>
          <strong>Session storage:</strong> Authentication session information
          is temporarily stored in the browser for the duration of your session.
        </li>
        <li>
          <strong>Local storage:</strong> We store whether you have dismissed a
          local announcement so that it does not reappear unnecessarily.
        </li>
        <li>
          <strong>Local browser cache:</strong> Your browser may temporarily
          cache transmitted files such as pages, scripts, and stylesheets in
          order to display the application efficiently and securely.
        </li>
      </ul>

      <p className="mb-4">
        This browser storage is used exclusively for technically necessary and
        user-requested functions. It is not used for tracking, profiling, or
        marketing purposes. You can delete locally stored data at any time in
        your browser settings; however, this may affect the availability of the
        login session or local preferences.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Email notifications from the ticket system
      </h3>

      <p className="mb-4">
        After you submit a request, the ticket system Redmine may send email
        notifications regarding the creation and processing of your request.
        These emails are sent to keep you informed about the status of your
        request and related communication.
      </p>

      <p className="mb-4">
        Notification settings can be adjusted or turned off in your personal
        Redmine settings at{" "}
        <a
          href="https://redmine.aet.cit.tum.de"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          redmine.aet.cit.tum.de
        </a>
        . Personal login to this application is handled via Keycloak. You can use your TUM credentials to login.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Right to file a complaint with the responsible supervisory authority
      </h3>

      <p className="mb-4">
        If you believe that the processing of your personal data violates
        applicable data protection laws, you have the right to lodge a complaint
        with a supervisory authority.
      </p>

      <p className="mb-4">
        Since this project is developed at the Technical University of Munich
        (TUM), a public institution in Bavaria, the applicable law is the
        Bavarian Data Protection Act (BayDSG), which supplements the General
        Data Protection Regulation (GDPR). The responsible supervisory authority
        for enforcing these regulations is:
      </p>

      <p className="mb-4">
        Bavarian State Commissioner for Data Protection (BayLfD)
        <br />
        Wagmullerstrasse 18
        <br />
        80538 Munich
        <br />
        Germany
        <br />
        Phone: +49 89 212672-0
        <br />
        Fax: +49 89 212672-50
        <br />
        Email:{" "}
        <a
          href="mailto:poststelle@datenschutz-bayern.de"
          className="text-primary hover:underline"
        >
          poststelle@datenschutz-bayern.de
        </a>
        <br />
        Website:{" "}
        <a
          href="https://www.datenschutz-bayern.de"
          className="text-primary hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          https://www.datenschutz-bayern.de
        </a>
      </p>

      <p className="mb-4">
        Alternatively, you may contact the supervisory authority in your place
        of residence or workplace. The supervisory authority will inform you
        about the progress and outcome of your complaint, including the
        possibility of a judicial remedy pursuant to Article 78 GDPR.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Right to object
      </h3>

      <p className="mb-4">
        In accordance with Art. 21 GDPR, you have the right, on grounds
        relating to your particular situation, to object at any time to the
        processing of your personal data where such processing is based on Art.
        6(1) lit. e GDPR. In that case, we will no longer process your personal
        data unless we can demonstrate compelling legitimate grounds for the
        processing which override your interests, rights and freedoms, or the
        processing serves the establishment, exercise or defence of legal
        claims.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Right to data portability
      </h3>

      <p className="mb-4">
        A right to data portability under Art. 20 GDPR exists only where
        processing is based on consent or on a contract and is carried out by
        automated means. As the processing described here is generally carried
        out on the basis of Art. 6(1) lit. e GDPR for the performance of tasks
        carried out in the public interest, the right to data portability does
        not generally apply.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Right to information, correction, blocking, and deletion
      </h3>

      <p className="mb-4">
        You have at any time within the framework of the applicable legal
        provisions the right to request information about your stored personal
        data, the origin of the data, its recipient and the purpose of the data
        processing, and if necessary, a right to correction, blocking or
        deletion of this data. You can contact us at any time via{" "}
        <a
          href="mailto:krusche@tum.de"
          className="text-primary hover:underline"
        >
          krusche@tum.de
        </a>{" "}
        regarding this and other questions on the subject of personal data.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Data Protection Officer
      </h3>

      <p className="mb-4">
        The data protection officer of the Technical University of Munich
        <br />
        Postal address: Arcisstrasse 21, 80333 Munich
        <br />
        Telephone: +49-(0)89-289-17052
        <br />
        E-mail:{" "}
        <a
          href="mailto:beauftragter@datenschutz.tum.de"
          className="text-primary hover:underline"
        >
          beauftragter@datenschutz.tum.de
        </a>
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">SSL/TLS encryption</h3>

      <p className="mb-4">
        For security reasons and to protect the transmission of confidential
        content that you send to us as a site operator, our website uses an
        SSL/TLS encryption. This means that data that you transmit via this
        website cannot be read by third parties. You can recognize an encrypted
        connection by the &quot;https://&quot; address line in your browser and
        by the lock symbol in the browser line.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">E-mail security</h3>

      <p className="mb-4">
        If you e-mail us, your e-mail address will only be used for
        correspondence with you. Please note that data transmission on the
        Internet can have security gaps. Complete protection of data from access
        by third parties is not possible.
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">
        Name and contact details of the person responsible
      </h3>

      <p className="mb-4">
        Technical University of Munich
        <br />
        Postal address: Prof. Dr. Stephan Krusche (CIT-I1) Boltzmannstrasse 3
        85748 Garching b. Munich
        <br />
        Office: 01.07.044
        <br />
        E-mail:{" "}
        <a
          href="mailto:krusche@tum.de"
          className="text-primary hover:underline"
        >
          krusche@tum.de
        </a>
      </p>
    </>
  );
}
