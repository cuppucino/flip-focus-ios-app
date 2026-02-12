import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SESSION_TAGS, SessionTag } from '../storage/sessionStorage';

interface TagSelectorProps {
  selected_tag: SessionTag;
  on_select: (tag: SessionTag) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ selected_tag, on_select }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>What are you focusing on?</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll_content}
      >
        {SESSION_TAGS.map((tag) => {
          const is_selected = selected_tag === tag.key;
          return (
            <TouchableOpacity
              key={tag.key}
              style={[
                styles.tag_chip,
                { borderColor: tag.color },
                is_selected && { backgroundColor: tag.color },
              ]}
              onPress={() => on_select(tag.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.tag_emoji}>{tag.emoji}</Text>
              <Text
                style={[
                  styles.tag_text,
                  { color: is_selected ? '#FFFFFF' : tag.color },
                ]}
              >
                {tag.label}
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
    marginBottom: 20,
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
  tag_chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tag_emoji: {
    fontSize: 16,
  },
  tag_text: {
    fontSize: 13,
    fontWeight: '600',
  },
});
