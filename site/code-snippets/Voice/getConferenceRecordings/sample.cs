var username = System.Environment.GetEnvironmentVariable("BW_USERNAME");
var password = System.Environment.GetEnvironmentVariable("BW_PASSWORD");
var accountId = System.Environment.GetEnvironmentVariable("BW_ACCOUNT_ID");

var conferenceId = "conf-95ac8d8d-28e06798-2afe-434c-b0f4-666a79cd47f8";

var client = new BandwidthClient.Builder()
    .VoiceBasicAuthCredentials(username, password)
    .Build();

var response = await client.Voice.APIController.GetQueryMetadataForAccountAndConferenceAsync(accountId, conferenceId);
