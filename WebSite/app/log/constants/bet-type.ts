import { SportType } from './../../shared/constants/sport-type.native';
export const BetType = {
    relatePlayer: ['9680', '9676', '9730', '9736', '9690', '9686', '9731', '9737',
        '9662', '9663', '9668', '9650', '9672', '9656', '9671', '9651', '9675', '9657']
}

export const MappingValue: { [key: string]: string } = {
    'D': 'Draw',
    'Y': 'Yes',
    'B': 'Bottom',
    'M': 'Middle',
    'NM': 'Top or Bottom',
    'NB': 'Top or Middle',
    'O': 'OverLord',
    'C': 'Caught',
    'NC': 'Not Caught',
    'LBW': 'LBW',
    'RO': 'Run Out',
    'S': 'Stumped',
    'OT': 'Others',
    'NONE': 'None',
}

export const MappingValueWithBettype: { [key: string]: string } = {
    'T-9113' : 'Top',
    'T-9141' : 'Tyrant',
    'NT-9135': 'Middle or Bottom',
    'NT-9142' : 'Overlord or Middle',
}

export const BetTypeWithNo: { [key: number]: string[] } = {
    [SportType.volleyBall]: ['3914'],
    [SportType.cricket]: ['9624', '9630', '9625', '9631'],
    [SportType.eSports]: ['9073', '9075', '9087', '9124', '9132', '9133']
}

export const SoccerResultValue: { [key: string]: string } = {
    '1-10': '00:01-10:00',
    '11-20': '10:01-20:00',
    '21-30': '20:01-30:00',
    '31-40': '30:01-40:00',
    '41-50': '40:01-50:00',
    '51-60': '50:01-60:00',
    '61-70': '60:01-70:00',
    '71-80': '70:01-80:00',
    '81-90': '80:01-FT',
    'NG': 'No Goal',
    'Y': 'Yes',
    'P': 'Penalty',
    'FK': 'Free Kick',
    'OG': 'Own Goal',
    'M': 'Miss',
    'NT': 'Not Taken',
    'X': 'Draw',
    'B': 'Both',
    'O': 'One',
    '1SNT': 'Home Score - Away Not Taken',
    '1MNT': 'Home Miss - Away Not Taken',
    'NT2S': 'Home Not Taken - Away Score',
    'NT2M': 'Home Not Taken - Away Miss'
}
export const SoccerResultValueWithBettype: { [key: string]: string } = {
    'S-424': 'Shot',
    'S-395': 'Shot',
    'S-381': 'Score',
    'S-382': 'Score',
    'N-390': 'No',
    'N-384': 'No Goal',
    'H-383': 'Hit',
    'N-383': 'Not Hit',
}
