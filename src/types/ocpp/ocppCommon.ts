export type OCPPIncomingRequest = [
  OCPPMessageType,
  string,
  OCPPActions,
  Record<string, unknown>,
];

export type OCPPOutgoingResponse = [
  OCPPMessageType,
  string,
  Record<string, unknown>,
];

export type OCPPErrorResponse = [
  OCPPMessageType,
  string,
  OCPPErrorType,
  string,
  Record<string, unknown>,
];

/**
 * OCPP message id type
 */
export enum OCPPMessageType {
  CALL = 2, // Client to Server
  CALL_RESULT = 3, // Server to Client
  CALL_ERROR = 4, // Server to Client
}

/**
 * OCPP Error code type
 */
export enum OCPPErrorType {
  // Requested Action is not known by receiver
  NOT_IMPLEMENTED = 'NotImplemented',
  // Requested Action is recognized but not supported by the receiver
  NOT_SUPPORTED = 'NotSupported',
  // An internal error occurred and the receiver was not able to process the requested Action successfully
  INTERNAL_ERROR = 'InternalError',
  // Payload for Action is incomplete
  PROTOCOL_ERROR = 'ProtocolError',
  // During the processing of Action a security issue occurred preventing receiver from completing the Action successfully
  SECURITY_ERROR = 'SecurityError',
  // Payload for Action is syntactically incorrect or not conform the PDU structure for Action
  FORMATION_VIOLATION = 'FormationViolation',
  // Payload is syntactically correct but at least one field contains an invalid value
  PROPERTY_CONSTRAINT_VIOLATION = 'PropertyConstraintViolation',
  // Payload for Action is syntactically correct but at least one of the fields violates occurrence constraints
  OCCURRENCE_CONSTRAINT_VIOLATION = 'OccurenceConstraintViolation',
  // Payload for Action is syntactically correct but at least one of the fields violates data type constraints (e.g. "somestring" = 12)
  TYPE_CONSTRAINT_VIOLATION = 'TypeConstraintViolation',
  // Any other error not covered by the previous ones
  GENERIC_ERROR = 'GenericError',
}

/**
 * OCPP command actions
 */
export enum OCPPActions {
  AUTHORIZE = 'Authorize',
  BOOT_NOTIFICATION = 'BootNotification',
  DATA_TRANSFER = 'DataTransfer',
  DIAGNOSTICS_STATUS_NOTIF = 'DiagnosticsStatusNotification',
  FIRMWARE_STATUS_NOTIF = 'FirmwareStatusNotification',
  HEARTBEAT = 'Heartbeat',
  METER_VALUES = 'MeterValues',
  START_TRANSACTION = 'StartTransaction',
  STATUS_NOTIFICATION = 'StatusNotification',
  STOP_TRANSACTION = 'StopTransaction',
  CANCEL_RESERVATION = 'CancelReservation',
  CHANGE_AVAILABILITY = 'ChangeAvailability',
  CHANGE_CONFIGURATION = 'ChangeConfiguration',
  CLEAR_CACHE = 'ClearCache',
  CLEAR_CHARGING_PROFILE = 'ClearChargingProfile',
  GET_COMPOSITE_SCHEDULE = 'GetCompositeSchedule',
  GET_CONFIGURATION = 'GetConfiguration',
  GET_DIAGNOSTICS = 'GetDiagnostics',
  GET_LOCAL_LIST_VERSION = 'GetLocalListVersion',
  REMOTE_START_TRANSACTION = 'RemoteStartTransaction',
  REMOTE_STOP_TRANSACTION = 'RemoteStopTransaction',
  RESERVE_NOW = 'ReserveNow',
  RESET = 'Reset',
  SEND_LOCAL_LIST = 'SendLocalList',
  SET_CHARGING_PROFILE = 'SetChargingProfile',
  TRIGGER_MESSAGE = 'TriggerMessage',
  UNLOCK_CONNECTOR = 'UnlockConnector',
  UPDATE_FIRMWARE = 'UpdateFirmware',
}

/**
 * OCPP status type
 */
export enum OCPPStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export enum OCPPResetStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export enum OCPPClearCacheStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export enum OCPPConfigurationStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  REBOOT_REQUIRED = 'RebootRequired',
  NOT_SUPPORTED = 'NotSupported',
}

export enum OCPPRemoteStartStopStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export enum OCPPUnlockStatus {
  UNLOCKED = 'Unlocked',
  UNLOCK_FAILED = 'UnlockFailed',
  NOT_SUPPORTED = 'NotSupported',
}

export enum OCPPChargingProfileStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  NOT_SUPPORTED = 'NotSupported',
}

export enum OCPPGetCompositeScheduleStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export enum OCPPClearChargingProfileStatus {
  ACCEPTED = 'Accepted',
  UNKNOWN = 'Unknown',
}

export enum OCPPAvailabilityStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  SCHEDULED = 'Scheduled',
}

export enum OCPPReserveNowStatus {
  ACCEPTED = 'Accepted',
  FAULTED = 'Faulted',
  OCCUPIED = 'Occupied',
  REJECTED = 'Rejected',
  UNAVAILABLE = 'Unavailable',
}

export enum OCPPCancelReservationStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

/**
 * OCPP common type
 */
export enum OCPPResetType {
  HARD = 'Hard',
  SOFT = 'Soft',
}

export enum OCPPChargingProfilePurposeType {
  CHARGE_POINT_MAX_PROFILE = 'ChargePointMaxProfile',
  TX_DEFAULT_PROFILE = 'TxDefaultProfile',
  TX_PROFILE = 'TxProfile',
}

export enum OCPPAvailabilityType {
  INOPERATIVE = 'Inoperative',
  OPERATIVE = 'Operative',
}
