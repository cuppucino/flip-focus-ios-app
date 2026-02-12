import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAudioPlayer, AudioPlayer } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';

export type SoundOption = 'none' | 'white_noise' | 'brown_noise' | 'rain' | 'lofi';

interface SoundConfig {
  key: SoundOption;
  label: string;
  emoji: string;
}

const SOUND_OPTIONS: SoundConfig[] = [
  { key: 'none', label: 'Silent', emoji: '🔇' },
  { key: 'white_noise', label: 'White', emoji: '📻' },
  { key: 'brown_noise', label: 'Brown', emoji: '🌊' },
  { key: 'rain', label: 'Rain', emoji: '🌧️' },
  { key: 'lofi', label: 'Lo-fi', emoji: '🎵' },
];

const SOUND_URIS: Record<string, string> = {
  white_noise: 'https://cdn.pixabay.com/audio/2022/03/10/audio_2f4e8b5611.mp3',
  brown_noise: 'https://cdn.pixabay.com/audio/2024/11/04/audio_4956b4aea1.mp3',
  rain: 'https://cdn.pixabay.com/audio/2022/09/07/audio_59ae41caa7.mp3',
  lofi: 'https://cdn.pixabay.com/audio/2024/09/17/audio_faa61b698b.mp3',
};

interface SoundPlayerProps {
  is_playing: boolean;
  selected_sound: SoundOption;
  on_select: (sound: SoundOption) => void;
}

export const SoundPlayer: React.FC<SoundPlayerProps> = ({
  is_playing,
  selected_sound,
  on_select,
}) => {
  // Use a default silent source; we replace it when the user picks a sound
  const player = useAudioPlayer(
    selected_sound !== 'none' && SOUND_URIS[selected_sound]
      ? { uri: SOUND_URIS[selected_sound] }
      : null
  );

  // Configure player properties
  useEffect(() => {
    if (!player) return;
    try {
      player.loop = true;
      player.volume = 0.5;
    } catch (e) {
      // Player may not be ready yet
    }
  }, [player, selected_sound]);

  // Play/pause based on is_playing
  useEffect(() => {
    if (!player) return;

    try {
      if (is_playing && selected_sound !== 'none') {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {
      console.warn('SoundPlayer play/pause error:', e);
    }
  }, [is_playing, selected_sound, player]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ambient Sound</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll_content}
      >
        {SOUND_OPTIONS.map((option) => {
          const is_selected = selected_sound === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.sound_chip,
                is_selected && styles.sound_chip_active,
              ]}
              onPress={() => on_select(option.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.sound_emoji}>{option.emoji}</Text>
              <Text
                style={[
                  styles.sound_text,
                  is_selected && styles.sound_text_active,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
    textAlign: 'center',
  },
  scroll_content: {
    paddingHorizontal: 4,
    gap: 8,
  },
  sound_chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sound_chip_active: {
    borderColor: '#A78BFA',
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  sound_emoji: {
    fontSize: 14,
  },
  sound_text: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  sound_text_active: {
    color: '#FFFFFF',
  },
});
