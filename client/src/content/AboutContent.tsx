export function AboutContent() {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">About AET Request</h2>

      <p className="mb-4">
        AET Request is the central resource management platform for the Applied
        Education Technologies (AET) research group at the Technical University
        of Munich (TUM).
      </p>

      <h3 className="text-lg font-medium mb-2 mt-6">What can you request?</h3>

      <ul className="list-disc list-inside space-y-2 mb-4">
        <li>
          <strong>Virtual Machines:</strong> Request new VMs for projects,
          theses, or chair activities
        </li>
        <li>
          <strong>VM Access:</strong> Request access to existing virtual
          machines
        </li>
        <li>
          <strong>Artemis Developer Access:</strong> Get contributor access to
          the Artemis learning platform
        </li>
        <li>
          <strong>TUM Guest Accounts:</strong> Request guest accounts for
          external collaborators
        </li>
      </ul>

      <h3 className="text-lg font-medium mb-2 mt-6">Contact</h3>

      <p className="mb-4">
        For questions or support, please contact the AET team or open a support
        ticket through the support link on the homepage.
      </p>
    </>
  );
}
