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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Styling helpers for focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    // Simulate API validation
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Logged in successfully!');
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
            {/* Login Card */}
            <View style={styles.card}>
              {/* Logo Area */}
              <Image
                source={require('@/assets/images/logo-hor-no-bg.png')}
                style={styles.logo}
              />
              
              <Text style={styles.tagline}>We wanna be your eyes</Text>

              {/* Form Fields */}
              <View style={styles.form}>
                
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

                {/* Password Input */}
                <View style={styles.inputContainer}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.label}>Password</Text>
                    <TouchableOpacity>
                      <Text style={styles.forgotText}>Forgot?</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        passwordFocused && styles.inputActive
                      ]}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="password"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.buttonText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                {/* Register Link */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <TouchableOpacity>
                    <Text style={styles.signUpText}>Sign Up</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
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
    backgroundColor: '#FFFFFF',
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
    borderColor: '#E5E7EB',
  },
  logo: {
    width: 240,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 0,
  },
  tagline: {
    fontFamily: 'Doto_500Medium',
    fontSize: 14, // Slightly increased since Doto is highly stylistic and can be small
    fontWeight: '500',
    color: '#F29440', // Vibrant brand orange to make the dots pop
    letterSpacing: 2, // Added more spacing since Doto is a dotted matrix font
    marginTop: -16, // Pulled up even tighter to the logo
    marginBottom: 32, // Compensating for the top margin
    textAlign: 'center',
  },
  form: {
    width: '100%',
    gap: 20,
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 11,
    color: '#F29440',
    fontWeight: 'bold',
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
  passwordWrapper: {
    position: 'relative',
    width: '100%',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: '100%',
    justifyContent: 'center',
  },
  eyeText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#F29440',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#F29440',
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
  footerText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: '#6B7280',
  },
  signUpText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: '#F29440',
    fontWeight: 'bold',
  },
});
