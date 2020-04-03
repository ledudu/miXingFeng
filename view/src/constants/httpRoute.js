const hostname = window.config.debug ? (window.config.domain + ":" + window.config.port) : window.config.domainUrl;
export const HTTP_URL = {
	"resetPassword": `${hostname}/reset_password`,
	"loginVerify": `${hostname}/login_verify`,
	"registerVerify": `${hostname}/register_verify`,
	"lastSign": `${hostname}/last_sign`,
	"goSign": `${hostname}/go_sign`,
	"retrieveOthers": `${hostname}/retrieve_others`,
	"appRelease": `${hostname}/apk/app_release.apk`,
	"checkUpdate": `${hostname}/check_update?appVersion={appVersion}&notCheckOutOfDateVersion={notCheckOutOfDateVersion}`,
	"tokenLogin": `${hostname}/token_login`,
	"searchRecord": `${hostname}/search_user_profile\?username={username}&slice={slice}`,
	"checkLog": hostname + "/check_log",
	"updateUserInfo": hostname + '/update_user_info',
	"feedback": hostname + '/feedback',
	"getList": hostname + "/get_list/?fileType={fileType}",
	"uploadFile": hostname + "/Images",
	"getLicence": hostname + "/get_licence",
	"getPrivacy": hostname + "/get_privacy",
	"getServiceList": hostname + "/get_service_list",
	"getUserAgreement": hostname + "/get_user_agreement",
	"getAdsConfig": hostname + "/get_ads_config",
	"heartBeat": hostname + "/heart_beat",
	"uploadPic": hostname + "/upload_pic",
	"signRecordTypeahead": hostname + "/sign_record_typeahead?query={query}",
	"getOnlinePersons": hostname + "/get_online_persons",
	"replaceSocketLink": hostname + "/replace_socket_link",
	"searchPosition": hostname + "/search_position\?username={username}&positiveUsername={positiveUsername}",
	"rpcCall": hostname + "/rpc_call",
	"uploadDeviceInfo": hostname + "/device_info",
	"getLoginRecord": hostname + "/get_login_record?username={username}&token={token}",
	"thirdLogin": hostname + "/mini_program_login?code={code}&env={env}&fromApp={fromApp}",
	"uploadRegistrationID": hostname + "/upload_registration_id",
	"saveSong": hostname + "/save_song",
	"delFile": hostname + "/del_file",
	"checkFileMD5": hostname + "/check_file_md5",
	"checkEmailValid": hostname + "/check_email_valid?value={value}&username={username}&email={email}&mobile={mobile}",
	"checkMobileValid": hostname + "/check_mobile_valid?value={value}&username={username}&mobile={mobile}&registerFromLogin={registerFromLogin}",
	"forgetPassword": hostname + "/forget_password",
	"getNetEaseCloudMusicLists": hostname + "/get_net_ease_cloud_music_lists?query={query}",
	"getQQMusicLists": hostname + "/get_qq_music_lists?query={query}",
	"getKuGouMusicLists": hostname + "/get_ku_gou_music_lists?query={query}",
	"getKuWoMusicLists": hostname + "/get_ku_wo_music_lists?query={query}",
	"getOnlineMusicLists": hostname + "/get_online_music_lists?query={query}",
	"getNetEaseCloudMusicLinksByIds": hostname + "/get_net_ease_cloud_music_links__by_ids",
	"getQQMusicLinksByIds": hostname + "/get_qq_music_links_by_ids",
	"getKuGouMusicLinksByIds": hostname + "/get_ku_gou_music_links_by_ids",
	"getKuWoMusicLinksByIds": hostname + "/get_ku_wo_music_links_by_ids",
	"getAdPicture": hostname + "/get_ad_picture",
	"getNetEaseCloudMvLink": hostname + "/get_net_ease_cloud_mv_link?id={id}&userId={userId}",
	"getQQMvLink": hostname + "/get_qq_mv_link?id={id}&userId={userId}",
	"userActivity": hostname + "/user_activity",
	"jiGuangVerify": hostname + "/ji_guang_verify",
	"getPositionFromH5": hostname + "/get_position_from_h5?location={location}",
}
