import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  UIManager
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type AuthView = 'login' | 'register' | 'forgot';

export default function AuthScreen() {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const switchView = (newView: AuthView) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCurrentView(newView);
  };
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Styling helpers for focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Logged in successfully!');
    }, 1500);
  };

  const handleRegister = () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Account created successfully!');
      switchView('login');
    }, 1500);
  };

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Check Your Email', `We've sent a password reset link to ${email}`);
      switchView('login');
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
        <KeyboardAwareScrollView
          style={styles.keyboardView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={styles.card}>
              <Image
                source={require('@/assets/images/logo-hor-no-bg.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              
              <Text style={styles.tagline}>We wanna be your eyes</Text>

              <View style={styles.form}>
                
                {currentView === 'forgot' && (
                  <>
                    <Text style={styles.instructionText}>
                      Enter your email address and we'll send you a link to reset your password.
                    </Text>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Email Address</Text>
                      <TextInput
                        style={[styles.input, emailFocused && styles.inputActive]}
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

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleResetPassword}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                      <TouchableOpacity onPress={() => switchView('login')}>
                        <Text style={styles.signUpText}>Back to Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {currentView === 'register' && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Full Name</Text>
                      <TextInput
                        style={[styles.input, nameFocused && styles.inputActive]}
                        placeholder="Enter your full name"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="words"
                        autoComplete="name"
                        value={name}
                        onChangeText={setName}
                        onFocus={() => setNameFocused(true)}
                        onBlur={() => setNameFocused(false)}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Email Address</Text>
                      <TextInput
                        style={[styles.input, emailFocused && styles.inputActive]}
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

                    <View style={styles.inputContainer}>
                      <View style={styles.passwordHeader}>
                        <Text style={styles.label}>Password</Text>
                      </View>
                      <View style={styles.passwordWrapper}>
                        <TextInput
                          style={[styles.input, styles.passwordInput, passwordFocused && styles.inputActive]}
                          placeholder="Create a password"
                          placeholderTextColor="#9CA3AF"
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoComplete="password-new"
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

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleRegister}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                      <Text style={styles.footerText}>Already have an account? </Text>
                      <TouchableOpacity onPress={() => switchView('login')}>
                        <Text style={styles.signUpText}>Sign In</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {currentView === 'login' && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Email Address</Text>
                      <TextInput
                        style={[styles.input, emailFocused && styles.inputActive]}
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

                    <View style={styles.inputContainer}>
                      <View style={styles.passwordHeader}>
                        <Text style={styles.label}>Password</Text>
                        <TouchableOpacity onPress={() => switchView('forgot')}>
                          <Text style={styles.forgotText}>Forgot?</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={styles.passwordWrapper}>
                        <TextInput
                          style={[styles.input, styles.passwordInput, passwordFocused && styles.inputActive]}
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

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleLogin}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign In</Text>}
                    </TouchableOpacity>

                    <View style={styles.footer}>
                      <Text style={styles.footerText}>Don't have an account? </Text>
                      <TouchableOpacity onPress={() => switchView('register')}>
                        <Text style={styles.signUpText}>Sign Up</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

              </View>
              </View>
            </View>
        </KeyboardAwareScrollView>
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EADBCB',
  },
  logo: {
    width: 240,
    height: 100,
    marginBottom: 0,
  },
  tagline: {
    fontFamily: 'Doto_500Medium',
    fontSize: 16,
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
    color: '#6C63FF',
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
    color: '#9CA3AF',
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
    color: '#6C63FF',
  },
});
