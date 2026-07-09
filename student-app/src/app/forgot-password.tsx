import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Styling helpers for focus states
  const [emailFocused, setEmailFocused] = useState(false);

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Check Your Email', `We've sent a password reset link to ${email}`);
      router.push('/');
    }, 1500);
  };

  return (
    <ImageBackground
      source={require('@/assets/images/bg-img.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar style="dark" />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Forgot Password Card */}
            <LinearGradient 
              colors={['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.card}
            >
              {/* Logo Area */}
              <Image
                source={require('@/assets/images/logo-hor-no-bg.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              
              <Text style={styles.tagline}>We wanna be your eyes</Text>

              {/* Form Fields */}
              <View style={styles.form}>
                
                <Text style={styles.instructionText}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                {/* Email Input */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={[
                      styles.input,
                      emailFocused && styles.inputActive
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>

                {/* Back to Login Link */}
                <View style={styles.footer}>
                  <Link href="/" asChild>
                    <TouchableOpacity>
                      <Text style={styles.signUpText}>Back to Sign In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>

              </View>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  logo: {
    width: 240,
    height: 100,
    marginBottom: 0,
  },
  tagline: {
    fontFamily: 'Doto_500Medium',
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
    marginTop: -16,
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 20,
  },
  instructionText: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 13,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  inputContainer: {
    width: '100%',
    gap: 6,
  },
  label: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: '#1F2937',
  },
  inputActive: {
    borderColor: '#F29440',
    shadowColor: '#F29440',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#111827',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signUpText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
});
