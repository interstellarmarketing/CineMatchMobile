# User Profile Documentation

This document provides an overview of the User Profile screen, its architecture, components, and functionality.

## Overview

The `ProfileScreen` is a dedicated screen where users can view their account information, access application settings, and sign out. It serves as a central hub for user-related actions and information.

## Architecture

The `ProfileScreen` is a standard React Native functional component. It uses `useSelector` to retrieve user information from the Redux store and `useDispatch` to handle actions like signing out.

### Key Components:
- **`SafeAreaView`**: Ensures content is displayed within the safe areas of the device.
- **`ScrollView`**: Allows the content to be scrollable, accommodating various screen sizes.
- **User Info Section**: Displays the user's avatar, name, and email.
- **Settings Section**: A list of tappable items that will navigate to different settings pages (e.g., Account, Preferences, Notifications). Currently, these are placeholders.
- **Logout Button**: A clearly marked button to initiate the sign-out process.

### State Management
- The screen is connected to the `userSlice` in the Redux store to get the current user's details.
- The `signOutUser` action from the `userSlice` is dispatched to handle the logout process.

### Example: `ProfileScreen.tsx`
```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { signOutUser } from '../utils/slices/userSlice';
import { RootState } from '../types';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.user);

  const handleLogout = () => {
    dispatch(signOutUser());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
      <Text style={styles.userEmail}>{user?.email}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};
// ... styles
export default ProfileScreen;
```

## Functionality

- **Display User Information**: Shows the logged-in user's name and email address.
- **Settings Navigation**: Provides entry points to various settings screens. (Note: The actual settings screens are not yet implemented).
- **Sign Out**: Allows the user to securely sign out of the application. A confirmation alert is shown before proceeding.

## Future Enhancements

- **Profile Picture**: Allow users to upload or change their profile picture.
- **Account Management**: Implement screens for changing password, updating email, and deleting the account.
- **App Preferences**: Build out the preferences screen to allow users to customize their experience (e.g., theme, notification settings).
- **Integration with `MyLists`**: Provide quick links or summaries of the user's favorite movies and watchlists directly on the profile screen.
