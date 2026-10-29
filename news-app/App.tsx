import React, { useEffect } from 'react';
import { StyleSheet, View, StatusBar, BackHandler } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NewsProvider, useNews } from './src/context/NewsContext';
import { TopHeaderBar } from './src/components/TopHeaderBar';
import { BottomNavBar } from './src/components/BottomNavBar';
import { PremiumSubscriptionModal } from './src/components/PremiumSubscriptionModal';
import { NotificationModal } from './src/components/NotificationModal';
import { AuthModal } from './src/components/AuthModal';
import { AdminCreateUserModal } from './src/components/AdminCreateUserModal';
import { SearchModal } from './src/components/SearchModal';
import { AdminSponsoredModal } from './src/components/AdminSponsoredModal';
import { ToastMessage } from './src/components/ToastMessage';
import { HomeScreen } from './src/screens/HomeScreen';
import { VideoScreen } from './src/screens/VideoScreen';
import { ColumnsScreen } from './src/screens/ColumnsScreen';
import { SubmitNewsScreen } from './src/screens/SubmitNewsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ArticleDetailSheet } from './src/screens/ArticleDetailSheet';
import { Colors } from './src/theme/colors';

const MainApp: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    currentTab,
    selectTab,
    selectedArticle,
    openArticle,
    closeArticle,
    selectedVideo,
    closeVideo,
    bookmarkedArticleIds,
    toggleBookmark,
    isUserPremium,
    upgradeToPremium,
    showPremiumDialog,
    setShowPremiumDialog,
    showNotificationDialog,
    setShowNotificationDialog,
    showAuthModal,
    setShowAuthModal,
    showAdminUserModal,
    setShowAdminUserModal,
    showSearchModal,
    setShowSearchModal,
    showSponsoredModal,
    setShowSponsoredModal,
    sponsoredBanner,
    updateSponsoredBanner,
    notifications,
    userProfile,
    login,
    register,
    createAdminUser,
    toastMessage,
    clearToast,
  } = useNews();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Handle Android Hardware Back Button
  useEffect(() => {
    const onBackPress = () => {
      // 1. Close open sheets & modals first
      if (selectedArticle) {
        closeArticle();
        return true;
      }
      if (selectedVideo) {
        closeVideo();
        return true;
      }
      if (showSearchModal) {
        setShowSearchModal(false);
        return true;
      }
      if (showSponsoredModal) {
        setShowSponsoredModal(false);
        return true;
      }
      if (showPremiumDialog) {
        setShowPremiumDialog(false);
        return true;
      }
      if (showNotificationDialog) {
        setShowNotificationDialog(false);
        return true;
      }
      if (showAuthModal) {
        setShowAuthModal(false);
        return true;
      }
      if (showAdminUserModal) {
        setShowAdminUserModal(false);
        return true;
      }

      // 2. If on any tab other than HOME, navigate back to HOME
      if (currentTab !== 'HOME') {
        selectTab('HOME');
        return true;
      }

      // 3. If on HOME tab with no dialogs open, allow default Android back behavior
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [
    selectedArticle,
    selectedVideo,
    showSearchModal,
    showSponsoredModal,
    showPremiumDialog,
    showNotificationDialog,
    showAuthModal,
    showAdminUserModal,
    currentTab,
    closeArticle,
    closeVideo,
    setShowSearchModal,
    setShowSponsoredModal,
    setShowPremiumDialog,
    setShowNotificationDialog,
    setShowAuthModal,
    setShowAdminUserModal,
    selectTab,
  ]);

  const renderCurrentTab = () => {
    switch (currentTab) {
      case 'HOME':
        return <HomeScreen />;
      case 'VIDEO':
        return <VideoScreen />;
      case 'COLUMNS':
        return <ColumnsScreen />;
      case 'POST':
        return <SubmitNewsScreen />;
      case 'PROFILE':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top Header Bar with Logo click -> HOME and Search Button */}
      <TopHeaderBar
        unreadCount={unreadCount}
        userAvatarUrl={userProfile.avatarUrl}
        onLogoClick={() => selectTab('HOME')}
        onSearchClick={() => setShowSearchModal(true)}
        onNotificationsClick={() => setShowNotificationDialog(true)}
        onProfileClick={() => selectTab('PROFILE')}
      />

      {/* Main Tab View */}
      <View style={styles.mainContent}>{renderCurrentTab()}</View>

      {/* Bottom Navigation Bar */}
      <BottomNavBar currentTab={currentTab} onTabSelected={selectTab} />

      {/* Article Detail Reader Bottom Sheet */}
      <ArticleDetailSheet
        article={selectedArticle}
        isBookmarked={
          selectedArticle ? bookmarkedArticleIds.has(selectedArticle.id) : false
        }
        isPremiumUser={isUserPremium}
        onDismiss={closeArticle}
        onToggleBookmark={() => {
          if (selectedArticle) toggleBookmark(selectedArticle.id);
        }}
        onGoPremium={() => {
          setShowPremiumDialog(true);
        }}
      />

      {/* Real-time Article Search Modal */}
      <SearchModal
        visible={showSearchModal}
        onDismiss={() => setShowSearchModal(false)}
        onSelectArticle={openArticle}
      />

      {/* Premium Subscription Modal */}
      <PremiumSubscriptionModal
        visible={showPremiumDialog}
        onDismiss={() => setShowPremiumDialog(false)}
        onSubscribe={upgradeToPremium}
      />

      {/* Notifications Alert Modal */}
      <NotificationModal
        visible={showNotificationDialog}
        notifications={notifications}
        onDismiss={() => setShowNotificationDialog(false)}
      />

      {/* Multi-Role Authentication Modal */}
      <AuthModal
        visible={showAuthModal}
        onDismiss={() => setShowAuthModal(false)}
        onLogin={login}
        onRegister={register}
      />

      {/* Admin Create Staff/Expert User Modal */}
      <AdminCreateUserModal
        visible={showAdminUserModal}
        onDismiss={() => setShowAdminUserModal(false)}
        onCreateUser={createAdminUser}
      />

      {/* Admin Sponsored Campaign Management Modal */}
      <AdminSponsoredModal
        visible={showSponsoredModal}
        initialBanner={sponsoredBanner}
        onDismiss={() => setShowSponsoredModal(false)}
        onSave={updateSponsoredBanner}
      />

      {/* Native-style Toast Feedback */}
      <ToastMessage message={toastMessage} onHide={clearToast} />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NewsProvider>
        <MainApp />
      </NewsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  mainContent: {
    flex: 1,
  },
});
