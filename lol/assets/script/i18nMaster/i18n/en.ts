/*
 * @Author: Y*Y*M
 * @Date: 2021-11-08 09:54:35
 * @Description: 
 * @FilePath: \ludo\assets\script\i18nMaster\i18n\en.ts
 */
//@ts-ignore
if (!window.i18nConfig) window.i18nConfig = {};
if (!window.i18nConfig.languages) window.i18nConfig.languages = {};
window.i18nConfig.languages.en = {
    "common": {
        "ok": "Ok",
        "cancel": "Cancel",
        "offline": "offline",
        "exit": "Are you sure to quit？\n You will lose the game.",
    },
    "hall": {
        "levelText": "Level %{level}",
        "playedText": "Played:%{played} Won:%{win}",
        "roomType": "%{needNumber} players",
        "roomPlayer": "%{curNumber}/%{needNumber} players",
    },
    "chat": {
        "enterContent": "Please input your message."
    },
    "game": {
        "you": "You",
        "waitOther": "Waiting for other players...",
        "selectTarget": "先选择攻击目标",
        "changePlayer": "当前回合玩家 %{name}",
        "attackText": "%{attackName} 攻击了 %{beattackName} 造成了 %{hurt} 点伤害",
        "winPlayerName": "%{name} won",
        "roundNumber": "Round ",
        "finalRound": "Final Round",
        "selfRound": "Your turn",
        "friendRound": "Teammate's turn",
        "otherRound": "Opponent's turn",
		"usePropMaxCount": "In one round, you can only use boosters twice",
		"propTip_1": "Action Card Lv1: Add an extra action",
		"propTip_2": "Action Card Lv2: Add two additional actions",
		"propTip_3": "Line Deletion Card Lv1: Randomly eliminate a row",
		"propTip_4": "Line Deletion Card Lv2: Randomly eliminate 3 rows",
		"propTip_5": "Column Elimination Card Lv1: Eliminate a column randomly",
		"propTip_6": "Column Elimination Card Lv2: Eliminate three columns randomly",
		"propTip_7": "Bomb Card Lv1: Explode a piece as the center to eliminate the pieces within 2 squares",
		"propTip_8": "Bomb Card Lv2: Explode a chess piece as the center to eliminate chess pieces within 3 squares",
		"propTip_9": "Reduction Card Lv1: Reduce the opponent's points by 10 points",
		"propTip_10": "Reduction Card Lv2: Reduce the opponent's points by 30 points",
		"propTip_11": "Hammer Card Lv1: Eliminate 3 pieces of the same faction",
		"propTip_12": "Hammer Card Lv2: Eliminate 9 pieces of the same faction",
		"propTip_13": "Missile Card Lv1: Randomly remove 5 pieces",
		"propTip_14": "Missile Card Lv2: Randomly remove 15 pieces",
		"propTip_15": "Variation Card Lv1: Randomly assign 3 chess pieces to our faction pieces",
		"propTip_16": "Variation Card Lv2: Randomly assign 9 chess pieces to our camp pieces",
		"propTip_17": "Conversion Card Lv1: Convert 3 pieces of the opponent's color to pieces of our color",
		"propTip_18": "Conversion Card Lv2: Convert 9 pieces of the opponent's color to pieces of our color",
		"propTip_19": "Clear Card Lv1: Randomly clear 1 item from the opponent",
		"propTip_20": "Clear Card Lv2: Randomly clear 3 items from the opponent",
		"propTip_21": "Effects Card Lv1: Add random special effects to 3 random pieces",
		"propTip_22": "Effects Card Lv2: Add random special effects to 9 pieces at random",
    },
    "settings": {
        "open": "On",
        "close": "Off"
    },
    "network": {
        "reconnect": "Network Disconnected.Reconnecting....",
        // 错误提示内容，error开头的是需要点击确认的，warning开头的是渐隐的， 对应NETWORK_ERROR_TYPE，如果是不需要的提示异常，则不需要写内容
        "error303": "The game table is full.",
        "error304": "The game table is closed",
        // "error100": "操作异常", 
        // "warning100": "操作异常",
        // "error200": "error200",
        // "error201": "error201",
        // "error202": "error202",
        // "error300": "error300",
        // "error301": "error301",
        // "error302": "error302",
    }
};
