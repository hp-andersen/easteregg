import { useState, useEffect } from 'react';
import { Screen, GameState } from './types';
import HomeScreen from './screens/HomeScreen';
import CreateChallengeScreen from './screens/CreateChallengeScreen';
import BrowseChallengesScreen from './screens/BrowseChallengesScreen';
import CustomChallengeScreen from './screens/CustomChallengeScreen';
import ResultScreen from './screens/ResultScreen';
import AboutScreen from './screens/AboutScreen';
import AdminScreen from './screens/AdminScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [gameState, setGameState] = useState<GameState>({
    challenge: null,
    isCustom: false,
    playerLat: null,
    playerLng: null,
    finalDistance: null,
    hitLucky: false,
  });

  useEffect(() => {
    console.log('Current screen changed to:', currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareCode = urlParams.get('code');
    if (shareCode) {
      setCurrentScreen('custom-challenge');
    }
  }, []);

  const navigateTo = (screen: Screen) => {
    console.log('Navigating to:', screen);
    if (screen === 'home' || screen === 'create-challenge' || screen === 'browse-challenges' || screen === 'admin') {
      setGameState({
        challenge: null,
        isCustom: false,
        playerLat: null,
        playerLng: null,
        finalDistance: null,
        hitLucky: false,
      });
    }
    setCurrentScreen(screen);
    console.log('Screen set to:', screen);
  };

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-white">
      {currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}
      {currentScreen === 'create-challenge' && (
        <CreateChallengeScreen onNavigate={navigateTo} />
      )}
      {currentScreen === 'browse-challenges' && (
        <BrowseChallengesScreen
          onNavigate={navigateTo}
          gameState={gameState}
          updateGameState={updateGameState}
        />
      )}
      {currentScreen === 'custom-challenge' && (
        <CustomChallengeScreen
          onNavigate={navigateTo}
          gameState={gameState}
          updateGameState={updateGameState}
        />
      )}
      {currentScreen === 'result' && (
        <ResultScreen
          onNavigate={navigateTo}
          gameState={gameState}
        />
      )}
      {currentScreen === 'about' && <AboutScreen onNavigate={navigateTo} />}
      {currentScreen === 'admin' && <AdminScreen onNavigate={navigateTo} />}
    </div>
  );
}

export default App;
