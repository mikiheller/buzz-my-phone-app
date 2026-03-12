export const colors = {
  background: '#FFF8F0',
  surface: '#FFFFFF',
  surfaceAlt: '#FFF0E6',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  textInverse: '#FFFFFF',

  primary: '#FF6B6B',
  primaryDark: '#E85555',
  secondary: '#2C3E50',
  accent: '#FFD93D',

  nudge: '#4ECDC4',
  nudgeDark: '#3DBEB5',
  hey: '#FF9F43',
  heyDark: '#E8903D',
  urgent: '#FF6B6B',
  urgentDark: '#E85555',
  emergency: '#FF3B30',
  emergencyDark: '#E0342A',

  border: '#E8E0D8',
  shadow: 'rgba(44, 62, 80, 0.08)',
  overlay: 'rgba(44, 62, 80, 0.6)',

  success: '#2ECC71',
  error: '#E74C3C',
};

export const buzzLevels = [
  {
    id: 'nudge',
    name: 'Nudge',
    emoji: '👋',
    description: 'Gentle single vibration',
    color: colors.nudge,
    colorDark: colors.nudgeDark,
  },
  {
    id: 'hey',
    name: 'Hey!',
    emoji: '📳',
    description: '3 strong vibration bursts',
    color: colors.hey,
    colorDark: colors.heyDark,
  },
  {
    id: 'urgent',
    name: 'URGENT',
    emoji: '🚨',
    description: 'Repeats until acknowledged',
    color: colors.urgent,
    colorDark: colors.urgentDark,
  },
  {
    id: 'emergency',
    name: 'EMERGENCY',
    emoji: '🆘',
    description: 'Max buzz + sound, won\'t stop',
    color: colors.emergency,
    colorDark: colors.emergencyDark,
  },
];
