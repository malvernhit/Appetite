import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Building2, User, Mail, Lock, Phone } from 'lucide-react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemedColors } from '@/hooks/useThemedColors';
import { supabase } from '@/lib/supabase';
import Button from '@/components/Button';

type UserRole = 'customer' | 'biker' | 'restaurant';

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useThemedColors();
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    bikePlate: '',
    restaurantName: '',
    restaurantAddress: '',
    cuisine: '',
  });

  const getSignUpErrorMessage = (error: any): string => {
    const message = error.message?.toLowerCase() || '';

    if (message.includes('user already registered') || message.includes('already exists')) {
      return 'An account with this email already exists. Please sign in or use a different email.';
    }

    if (message.includes('password') && message.includes('short')) {
      return 'Your password is too short. Please use at least 6 characters.';
    }

    if (message.includes('password') && (message.includes('weak') || message.includes('strength'))) {
      return 'Please choose a stronger password. Include letters, numbers, and special characters.';
    }

    if (message.includes('invalid email') || message.includes('email format')) {
      return 'The email address format is invalid. Please check and try again.';
    }

    if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    if (message.includes('duplicate') || message.includes('unique constraint')) {
      return 'This information is already registered. Please use different details or contact support.';
    }

    return 'Unable to create your account. Please check your information and try again.';
  };

  const handleSignUp = async () => {
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      Alert.alert('Missing Information', 'Please fill in all required fields to continue.');
      return;
    }

    if (formData.fullName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Please enter your full name (at least 2 characters).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Weak Password', 'Your password must be at least 6 characters long.');
      return;
    }

    if (role === 'biker' && !formData.bikePlate.trim()) {
      Alert.alert('Missing Information', 'Please enter your bike plate number to continue as a biker.');
      return;
    }

    if (role === 'restaurant') {
      if (!formData.restaurantName.trim()) {
        Alert.alert('Missing Information', 'Please enter your restaurant name.');
        return;
      }
      if (!formData.restaurantAddress.trim()) {
        Alert.alert('Missing Information', 'Please enter your restaurant address.');
        return;
      }
      if (!formData.cuisine.trim()) {
        Alert.alert('Missing Information', 'Please enter your cuisine type.');
        return;
      }
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
            phone: formData.phone.trim(),
            user_mode: role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: userError } = await supabase.from('users').insert({
          id: authData.user.id,
          email: formData.email.trim(),
          full_name: formData.fullName.trim(),
          phone: formData.phone.trim() || null,
          user_mode: role,
        });

        if (userError) throw userError;

        if (role === 'biker') {
          const { error: bikerError } = await supabase.from('bikers').insert({
            id: authData.user.id,
            bike_plate: formData.bikePlate.trim(),
          });

          if (bikerError) throw bikerError;
        }

        if (role === 'restaurant') {
          const { error: restaurantError } = await supabase.from('restaurants').insert({
            owner_id: authData.user.id,
            name: formData.restaurantName.trim(),
            address: formData.restaurantAddress.trim(),
            cuisine: formData.cuisine.trim(),
            latitude: 40.7580,
            longitude: -73.9855,
          });

          if (restaurantError) throw restaurantError;
        }

        await supabase.auth.signOut();

        const roleText = role === 'customer' ? 'customer' : role === 'biker' ? 'biker' : 'restaurant owner';
        Alert.alert(
          'Welcome!',
          `Your ${roleText} account has been created successfully. You can now sign in.`,
          [{ text: 'Sign In', onPress: () => router.replace('/signin') }]
        );
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      const friendlyMessage = getSignUpErrorMessage(error);
      Alert.alert('Sign Up Failed', friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Sign up to get started
          </Text>
        </View>

        <View style={styles.roleSelector}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              role === 'customer' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('customer')}
          >
            <User size={24} color={role === 'customer' ? Colors.primary : colors.muted} />
            <Text
              style={[
                styles.roleButtonText,
                { color: role === 'customer' ? Colors.primary : colors.muted },
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              { backgroundColor: colors.card, borderColor: colors.border },
              role === 'restaurant' && styles.roleButtonActive,
            ]}
            onPress={() => setRole('restaurant')}
          >
            <Building2 size={24} color={role === 'restaurant' ? Colors.primary : colors.muted} />
            <Text
              style={[
                styles.roleButtonText,
                { color: role === 'restaurant' ? Colors.primary : colors.muted },
              ]}
            >
              Restaurant
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <User size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.muted}
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Mail size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Lock size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Phone</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Phone size={20} color={colors.muted} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.muted}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {role === 'biker' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Bike Plate Number</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Enter bike plate number"
                  placeholderTextColor={colors.muted}
                  value={formData.bikePlate}
                  onChangeText={(text) => setFormData({ ...formData, bikePlate: text })}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          )}

          {role === 'restaurant' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Restaurant Name</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Building2 size={20} color={colors.muted} />
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter restaurant name"
                    placeholderTextColor={colors.muted}
                    value={formData.restaurantName}
                    onChangeText={(text) => setFormData({ ...formData, restaurantName: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Restaurant Address</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Enter restaurant address"
                    placeholderTextColor={colors.muted}
                    value={formData.restaurantAddress}
                    onChangeText={(text) => setFormData({ ...formData, restaurantAddress: text })}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Cuisine Type</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="e.g., Italian, Chinese, Mexican"
                    placeholderTextColor={colors.muted}
                    value={formData.cuisine}
                    onChangeText={(text) => setFormData({ ...formData, cuisine: text })}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        <Button
          title={loading ? 'Creating Account...' : 'Sign Up'}
          onPress={handleSignUp}
          disabled={loading}
          style={styles.signUpButton}
        />

        <TouchableOpacity onPress={() => setRole('biker')} style={styles.bikerLink}>
          <Text style={[styles.bikerLinkText, { color: colors.muted }]}>
            I'm a biker
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.muted }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/signin')}>
            <Text style={[styles.footerLink, { color: Colors.primary }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.title,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Typography.body,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  roleButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  roleButtonText: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    ...Typography.body,
    paddingVertical: Spacing.xs,
  },
  signUpButton: {
    marginBottom: Spacing.md,
  },
  bikerLink: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  bikerLinkText: {
    ...Typography.caption,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...Typography.body,
  },
  footerLink: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
});
