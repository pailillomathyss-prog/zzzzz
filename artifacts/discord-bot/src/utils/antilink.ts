// Détecte tous les types de liens : URLs, invitations Discord, liens d'apps, domaines nus
const LINK_REGEX =
  /(?:https?:\/\/|www\.)[^\s<>"']+|discord(?:\.gg|app\.com\/invite)\/[^\s<>"']+|(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+(?:com|net|org|io|gg|tv|co|app|dev|me|ly|link|xyz|fr|de|uk|ru|jp|cn|br|ca|it|es|nl|se|no|dk|fi|pl|ua|tn|ma|eg|dz|be|ch|at|pt|gr|tr|il|sa|ae|in|lk|bd|np|th|vn|ph|id|my|sg|tw|kr|au|nz|za|ng|ke|gh|ci|sn|cm|et|ug|tz|rw|mz|zm|mw|bw|na|zw|ao|cd|cg|ga|gq|td|cf|sl|gn|gw|ml|mr|ne|bf|tg|bj|ss|so|dj|er|sd|ly|tn|ma|spotify|youtube|youtu|tiktok|instagram|twitter|twitch|snapchat|telegram|whatsapp|reddit|github|gitlab|steam|epicgames|discord|roblox|minecraft|xbox|playstation|pinterest|linkedin|facebook|fb|soundcloud|mixcloud|beatport|bandcamp|patreon|onlyfans|kick|rumble|odysee|bitchute|dailymotion|vimeo|streamable|imgur|gyazo|prnt|prntscr|dropbox|drive|docs|onedrive|mediafire|wetransfer|mega|zippyshare|4shared|sendspace|rapidgator|uploaded|filefactory|datanodes|nitroflare|turbonit|katfile|hitf|filejoker|ddownload|clicknupload|uploadhaven|ufile|1fichier|dl|cdn|cdn\d+|files|file|f|s|i|img|image|static|assets|media|m|api|v|t|c|g|l|r|a|b|e|h|j|k|n|o|p|q|u|w|x|y|z)\b(?:\/[^\s<>"']*)?/gi;

export function containsLink(content: string): boolean {
  LINK_REGEX.lastIndex = 0;
  return LINK_REGEX.test(content);
}
