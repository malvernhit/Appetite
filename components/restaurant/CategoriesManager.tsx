import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  description: string;
  display_order: number;
  is_active: boolean;
}

interface CategoriesManagerProps {
  restaurantId: string;
  colors: any;
}

export default function CategoriesManager({ restaurantId, colors }: CategoriesManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, [restaurantId]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setModalVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('food_categories')
          .update({
            name: formData.name,
            description: formData.description,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingCategory.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('food_categories')
          .insert({
            restaurant_id: restaurantId,
            name: formData.name,
            description: formData.description,
            display_order: categories.length,
          });

        if (error) throw error;
      }

      setModalVisible(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('food_categories')
                .delete()
                .eq('id', category.id);

              if (error) throw error;
              loadCategories();
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert('Error', 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      const { error } = await supabase
        .from('food_categories')
        .update({ is_active: !category.is_active })
        .eq('id', category.id);

      if (error) throw error;
      loadCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      Alert.alert('Error', 'Failed to update category status');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Food Categories</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Organize your menu items into categories
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCategory}>
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Add Category</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.grid}>
          {categories.map((category) => (
            <View
              key={category.id}
              style={[styles.card, { backgroundColor: colors.card, opacity: category.is_active ? 1 : 0.6 }]}
            >
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{category.name}</Text>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleEditCategory(category)}
                  >
                    <Edit2 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleDeleteCategory(category)}
                  >
                    <Trash2 size={18} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              </View>
              {category.description && (
                <Text style={[styles.cardDescription, { color: colors.muted }]}>
                  {category.description}
                </Text>
              )}
              <TouchableOpacity
                style={[styles.statusButton, category.is_active && styles.statusButtonActive]}
                onPress={() => toggleCategoryStatus(category)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    { color: category.is_active ? Colors.success : colors.muted },
                  ]}
                >
                  {category.is_active ? 'Active' : 'Inactive'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {categories.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No categories yet. Create your first category to get started.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Category Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g., Appetizers, Main Course"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
                <TextInput
                  style={[styles.textarea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Brief description of this category"
                  placeholderTextColor={colors.muted}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { borderColor: colors.border }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSaveCategory}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.modalButtonTextSave}>
                      {editingCategory ? 'Update' : 'Create'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    ...Typography.title,
    fontWeight: '700',
  },
  subtitle: {
    ...Typography.body,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  addButtonText: {
    color: Colors.white,
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  card: {
    width: 300,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.subheadline,
    fontWeight: '600',
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  cardDescription: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  statusButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.neutral,
  },
  statusButtonActive: {
    backgroundColor: Colors.success + '20',
  },
  statusButtonText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  emptyState: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...Typography.body,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.floating,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    ...Typography.headline,
    fontWeight: '700',
  },
  form: {
    gap: Spacing.lg,
  },
  formGroup: {
    gap: Spacing.sm,
  },
  label: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Typography.body,
  },
  textarea: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonCancel: {
    borderWidth: 1,
  },
  modalButtonSave: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  modalButtonTextSave: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.white,
  },
});
