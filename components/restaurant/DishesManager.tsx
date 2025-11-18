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
  Image,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { Plus, Edit2, Trash2, X, ImageIcon, DollarSign } from 'lucide-react-native';

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category_id?: string;
  preparation_time: number;
  is_available: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface DishesManagerProps {
  restaurantId: string;
  colors: any;
}

export default function DishesManager({ restaurantId, colors }: DishesManagerProps) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    preparation_time: '15',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [restaurantId]);

  const loadData = async () => {
    try {
      const [dishesRes, categoriesRes] = await Promise.all([
        supabase
          .from('dishes')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('created_at', { ascending: false }),
        supabase
          .from('food_categories')
          .select('id, name')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .order('display_order', { ascending: true }),
      ]);

      if (dishesRes.error) throw dishesRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setDishes(dishesRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: categories[0]?.id || '',
      preparation_time: '15',
    });
    setModalVisible(true);
  };

  const handleEditDish = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      image_url: dish.image_url || '',
      category_id: dish.category_id || '',
      preparation_time: dish.preparation_time.toString(),
    });
    setModalVisible(true);
  };

  const handleSaveDish = async () => {
    if (!formData.name.trim() || !formData.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setSaving(true);
    try {
      const dishData = {
        name: formData.name,
        description: formData.description,
        price: price,
        image_url: formData.image_url || null,
        category_id: formData.category_id || null,
        preparation_time: parseInt(formData.preparation_time) || 15,
      };

      if (editingDish) {
        const { error } = await supabase
          .from('dishes')
          .update(dishData)
          .eq('id', editingDish.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('dishes')
          .insert({
            ...dishData,
            restaurant_id: restaurantId,
          });

        if (error) throw error;
      }

      setModalVisible(false);
      loadData();
    } catch (error) {
      console.error('Error saving dish:', error);
      Alert.alert('Error', 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDish = async (dish: Dish) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${dish.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('dishes')
                .delete()
                .eq('id', dish.id);

              if (error) throw error;
              loadData();
            } catch (error) {
              console.error('Error deleting dish:', error);
              Alert.alert('Error', 'Failed to delete menu item');
            }
          },
        },
      ]
    );
  };

  const toggleDishAvailability = async (dish: Dish) => {
    try {
      const { error } = await supabase
        .from('dishes')
        .update({ is_available: !dish.is_available })
        .eq('id', dish.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating dish availability:', error);
      Alert.alert('Error', 'Failed to update availability');
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
          <Text style={[styles.title, { color: colors.text }]}>Menu Items</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Manage your food items and pricing
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddDish}>
          <Plus size={20} color={Colors.white} />
          <Text style={styles.addButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.grid}>
          {dishes.map((dish) => (
            <View
              key={dish.id}
              style={[styles.card, { backgroundColor: colors.card, opacity: dish.is_available ? 1 : 0.6 }]}
            >
              {dish.image_url ? (
                <Image source={{ uri: dish.image_url }} style={styles.dishImage} />
              ) : (
                <View style={[styles.dishImagePlaceholder, { backgroundColor: colors.background }]}>
                  <ImageIcon size={32} color={colors.muted} />
                </View>
              )}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {dish.name}
                  </Text>
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleEditDish(dish)}
                    >
                      <Edit2 size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => handleDeleteDish(dish)}
                    >
                      <Trash2 size={18} color={Colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.cardDescription, { color: colors.muted }]} numberOfLines={2}>
                  {dish.description}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={[styles.price, { color: Colors.primary }]}>
                    ${dish.price.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={[styles.statusButton, dish.is_available && styles.statusButtonActive]}
                    onPress={() => toggleDishAvailability(dish)}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        { color: dish.is_available ? Colors.success : colors.muted },
                      ]}
                    >
                      {dish.is_available ? 'Available' : 'Unavailable'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {dishes.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No menu items yet. Add your first item to get started.
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
        <ScrollView
          contentContainerStyle={styles.modalOverlay}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingDish ? 'Edit Menu Item' : 'Add Menu Item'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Item Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="e.g., Margherita Pizza"
                  placeholderTextColor={colors.muted}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
                <TextInput
                  style={[styles.textarea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="Describe your dish"
                  placeholderTextColor={colors.muted}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Price ($) *</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.muted}
                    value={formData.price}
                    onChangeText={(text) => setFormData({ ...formData, price: text })}
                    keyboardType="decimal-pad"
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.text }]}>Prep Time (min)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                    placeholder="15"
                    placeholderTextColor={colors.muted}
                    value={formData.preparation_time}
                    onChangeText={(text) => setFormData({ ...formData, preparation_time: text })}
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              {categories.length > 0 && (
                <View style={styles.formGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Category</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryList}
                  >
                    {categories.map((category) => (
                      <TouchableOpacity
                        key={category.id}
                        style={[
                          styles.categoryChip,
                          formData.category_id === category.id && styles.categoryChipActive,
                          { borderColor: colors.border },
                        ]}
                        onPress={() => setFormData({ ...formData, category_id: category.id })}
                      >
                        <Text
                          style={[
                            styles.categoryChipText,
                            { color: formData.category_id === category.id ? Colors.white : colors.text },
                          ]}
                        >
                          {category.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Image URL (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor={colors.muted}
                  value={formData.image_url}
                  onChangeText={(text) => setFormData({ ...formData, image_url: text })}
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
                  onPress={handleSaveDish}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={Colors.white} />
                  ) : (
                    <Text style={styles.modalButtonTextSave}>
                      {editingDish ? 'Update' : 'Create'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
    width: 280,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.card,
  },
  dishImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  dishImagePlaceholder: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    ...Typography.bodyMedium,
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
    marginBottom: Spacing.sm,
    minHeight: 32,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...Typography.subheadline,
    fontWeight: '700',
  },
  statusButton: {
    paddingHorizontal: Spacing.sm,
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
    fontSize: 11,
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
    flexGrow: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
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
  formRow: {
    flexDirection: 'row',
    gap: Spacing.md,
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
  categoryList: {
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    ...Typography.caption,
    fontWeight: '600',
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
