import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../theme';

interface CategoryChipsProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
}

export default function CategoryChips({
    categories,
    selectedCategory,
    onSelectCategory,
}: CategoryChipsProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {categories.map((category) => {
                    const isSelected = selectedCategory === category;
                    return (
                        <TouchableOpacity
                            key={category}
                            style={[styles.chip, isSelected && styles.chipSelected]}
                            onPress={() => onSelectCategory(category)}
                        >
                            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                                {category}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.sm,
    },
    scrollContent: {
        paddingHorizontal: spacing.md,
        gap: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        backgroundColor: colors.light.surface,
        borderWidth: 1,
        borderColor: colors.light.border,
    },
    chipSelected: {
        backgroundColor: colors.light.primary,
        borderColor: colors.light.primary,
    },
    chipText: {
        ...typography.bodySmall,
        color: colors.light.text,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: '#fff',
    },
});
