import requests
import config
import util

OSU_API_ENDPOINT = "https://osu.ppy.sh"

class OsuUser:
    def __init__(self, data):
        data = data[0]
        self.username = data['username']
        self.pp_raw = data['pp_raw']
        self.pp_rank = data['pp_rank']

class OsuBeatmap:
    def __init__(self, data):
        self.artist = data['artist']
        self.title = data['title']
        self.stars = data['difficultyrating']
        self.max_combo = data['max_combo']
        self.total_length = data['total_length']
        self.creator = data['creator']

def get_user_data(message):
    content = message.content.replace(util.OSU_USER_COMMAND,"").replace(util.TOP_PLAY_COMMAND, "").strip()
    url = OSU_API_ENDPOINT + "/api/get_user"
    params = {"k": config.OSU_API_KEY,
            "u":content}
    r = requests.get(url=url, params=params)
    data = r.json()
    member_osu_profile = OsuUser(data)
    get_user_top_plays(member_osu_profile)
    return member_osu_profile

def get_user_top_plays(osu_user):
    url = OSU_API_ENDPOINT + "/api/get_user_best"
    params = {"k": config.OSU_API_KEY,
            "u":osu_user.username,
            "limit": 3}
    r = requests.get(url=url, params=params)
    data = r.json()
    content_out = osu_user.username + "'s top plays:\n"
    for play in data:
        beatmap = get_beatmap(play['beatmap_id'])
        content_out +=  beatmap.title + " - " + beatmap.artist + '\n' + "by " + beatmap.creator + '\n'
        content_out += play['maxcombo'] + '/' + beatmap.max_combo + "combo \|\| " + play['pp'] + " pp\n"
        content_out += play['count300'] + '/' + play['count100'] + '/' + play['count50'] + '\n'
        content_out += "Rank: " + play['rank'] + '\n'
        if play['perfect'] == 1:
            content_out += "FULL COMBO\n"
        content_out += '----------------------------------------\n'
    return content_out

def get_beatmap(beatmap_id):
    url = OSU_API_ENDPOINT + "/api/get_beatmaps"
    params = {"k": config.OSU_API_KEY,
            "b": beatmap_id}
    r = requests.get(url=url, params=params)
    data = r.json()
    data = data[0]
    return OsuBeatmap(data)
