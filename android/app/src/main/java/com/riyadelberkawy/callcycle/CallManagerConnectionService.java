import android.telecom.Connection;
import android.telecom.ConnectionService;
import android.telecom.PhoneAccountHandle;
import android.telecom.ConnectionRequest;
import android.telecom.DisconnectCause;
import android.telecom.TelecomManager;

public class CallManagerConnection extends Connection {
    @Override
    public void onShowIncomingCallUi() {
        super.onShowIncomingCallUi();
        // Handle showing the incoming call UI
    }

    @Override
    public void onAnswer() {
        super.onAnswer();
        // Handle the answer action
        setActive();  // Set the call to active state
    }

    @Override
    public void onReject() {
        super.onReject();
        // Handle the reject action
        setDisconnected(new DisconnectCause(DisconnectCause.REJECTED));
        destroy();
    }

    // Implement other call actions like onHold, onUnhold, onDisconnect, etc.
    @Override
    public void onHold() {
        super.onHold();
        // Handle the hold action
        setOnHold();
    }

    @Override
    public void onUnhold() {
        super.onUnhold();
        // Handle the unhold action
        setActive();
    }

    @Override
    public void onDisconnect() {
        super.onDisconnect();
        // Handle the disconnect action
        setDisconnected(new DisconnectCause(DisconnectCause.LOCAL));
        destroy();
    }
}

public class CallManagerConnectionService extends ConnectionService {
    @Override
    public Connection onCreateOutgoingConnection(
        PhoneAccountHandle connectionManagerPhoneAccount,
        ConnectionRequest request
    ) {
        CallManagerConnection connection = new CallManagerConnection();
        connection.setAddress(request.getAddress(), TelecomManager.PRESENTATION_ALLOWED);
        connection.setDialing();
        // You can set more properties on the connection here
        // For example, connection.setCallerDisplayName("Caller Name", TelecomManager.PRESENTATION_ALLOWED)
        return connection;
    }

    @Override
    public Connection onCreateIncomingConnection(
        PhoneAccountHandle connectionManagerPhoneAccount,
        ConnectionRequest request
    ) {
        CallManagerConnection connection = new CallManagerConnection();
        connection.setAddress(request.getAddress(), TelecomManager.PRESENTATION_ALLOWED);
        connection.setRinging();
        // Implement your logic for incoming calls
        // For example, show your own UI or handle the call in some way
        return connection;
    }
}


