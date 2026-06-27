import { useState, useEffect, useCallback } from 'react';
import { Onboarding } from './components/Onboarding';
import { VideoCard } from './components/VideoCard';
import { FloatingDock } from './components/FloatingDock';
import { ChatPanel } from './components/ChatPanel';
import { VideoEffectsPanel } from './components/VideoEffectsPanel';
import { FloatingReactions, ReactionPicker } from './components/FloatingReactions';
import { IcebreakerOverlay, getRandomQuestion } from './components/IcebreakerOverlay';
import { MiniGame, WYR_QUESTIONS } from './components/MiniGame';
import { AddFriendButton, FriendConnectedModal } from './components/AddFriendButton';
import { SkipReasonModal } from './components/SkipReasonModal';
import { MatchmakingScreen } from './components/MatchmakingScreen';
import { useWebRTC } from './hooks/useWebRTC';
import { useVoiceChanger } from './hooks/useVoiceChanger';
import { usePictureInPicture } from './hooks/usePictureInPicture';
import { useUserStats } from './hooks/useUserStats';
import { AnimatePresence, motion } from 'framer-motion';

function App() {
  const [view, setView] = useState('onboarding'); // onboarding, room
  
  const {
    connectionState,
    localStream,
    remoteStream,
    onlineCount,
    messages,
    isTyping,
    startCamera,
    stopCamera,
    toggleTrack,
    findPartner,
    stopChat,
    sendMessage,
    sendTyping,
    switchCamera,
    // Screen sharing
    isScreenSharing,
    shareScreen,
    stopScreenShare,
    // Reactions
    sendReaction,
    setOnRemoteReaction,
    // Icebreaker
    icebreakerQuestion,
    sendIcebreaker,
    dismissIcebreaker,
    // Games
    startGame,
    setOnGameStart,
    tttBoard,
    tttIsMyTurn,
    tttMySymbol,
    tttWinner,
    makeTTTMove,
    resetTTT,
    wyrQuestion,
    wyrMyPick,
    wyrPartnerPick,
    sendWYRQuestion,
    pickWYR,
    // Chess
    chessState,
    chessIsMyTurn,
    chessMyColor,
    chessStatus,
    makeChessMove,
    resetChess,
    // Friend
    friendRequested,
    friendAccepted,
    friendRoomCode,
    friendRequestReceived,
    sendFriendRequest,
    // Skip reason
    sendSkipReason,
    // Socket ref
    socketRef,
    partnerMeta,
  } = useWebRTC();

  const { voicePreset, setVoicePreset, applyPreset } = useVoiceChanger();
  const { isPiP, togglePiP, setVideoElement } = usePictureInPicture();
  const { profile, addHistory } = useUserStats();

  const [camEnabled, setCamEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  // UI state for panels/modals
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);

  // Floating reactions
  const [reactions, setReactions] = useState([]);

  // Auto-accept friend request if partner also requested
  useEffect(() => {
    if (friendRequestReceived && !friendRequested) {
      // Show visual cue that partner wants to be friends
    }
  }, [friendRequestReceived, friendRequested]);

  // Show friend modal when accepted
  useEffect(() => {
    if (friendAccepted && friendRoomCode) {
      setShowFriendModal(true);
    }
  }, [friendAccepted, friendRoomCode]);

  // Register remote reaction handler
  useEffect(() => {
    setOnRemoteReaction((emoji) => {
      addFloatingReaction(emoji);
    });
  }, [setOnRemoteReaction]);

  // Register game start handler
  useEffect(() => {
    setOnGameStart((gameType) => {
      setShowMiniGame(true);
    });
  }, [setOnGameStart]);

  const addFloatingReaction = useCallback((emoji) => {
    const id = Date.now() + Math.random();
    setReactions(prev => [...prev, { id, emoji }]);
  }, []);

  const removeFloatingReaction = useCallback((id) => {
    setReactions(prev => prev.filter(r => r.id !== id));
  }, []);

  // Apply voice changer when preset changes
  useEffect(() => {
    if (localStream && voicePreset !== 'normal') {
      applyPreset(localStream, voicePreset);
    }
  }, [voicePreset, localStream, applyPreset]);

  // Track match history
  useEffect(() => {
    if (connectionState === 'connected' && partnerMeta) {
      addHistory(partnerMeta);
    }
  }, [connectionState, partnerMeta]);

  const handleStart = async (setupData) => {
    await startCamera(); // If it fails, that's okay, localStream will just be null
    setView('room');
    
    // Combine profile data with setup data
    const findMeta = {
      ...profile,
      ...setupData
    };
    findPartner(findMeta);
  };

  const handleNext = () => {
    // Show skip reason modal if we're connected
    if (connectionState === 'connected') {
      setShowSkipModal(true);
    } else {
      findPartner();
    }
  };

  const handleSkipWithReason = (reason) => {
    sendSkipReason(reason);
    setShowSkipModal(false);
    findPartner();
  };

  const handleStop = () => {
    stopChat();
  };

  const handleToggleCam = async () => {
    if (!localStream) {
      const success = await startCamera();
      if (success) {
        setCamEnabled(true);
        setMicEnabled(true);
      }
      return;
    }
    const isEnabled = toggleTrack('video');
    setCamEnabled(isEnabled);
  };

  const handleToggleMic = async () => {
    if (!localStream) {
      const success = await startCamera();
      if (success) {
        setCamEnabled(true);
        setMicEnabled(true);
      }
      return;
    }
    const isEnabled = toggleTrack('audio');
    setMicEnabled(isEnabled);
  };

  const handleExit = () => {
    stopChat();
    stopCamera();
    setView('onboarding');
  };

  const handleScreenShare = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await shareScreen();
    }
  };

  const handleReactionPick = (emoji) => {
    sendReaction(emoji);
    addFloatingReaction(emoji);
    setShowReactionPicker(false);
  };

  const handleIcebreaker = () => {
    const question = getRandomQuestion();
    sendIcebreaker(question);
  };

  const handleStartGame = (gameType) => {
    startGame(gameType);
    if (gameType === 'wyr') {
      const idx = Math.floor(Math.random() * WYR_QUESTIONS.length);
      sendWYRQuestion(WYR_QUESTIONS[idx]);
    }
  };

  // PiP video ref callback
  const handlePiPRef = useCallback((el) => {
    if (el) setVideoElement(el);
  }, [setVideoElement]);

  return (
    <div className="relative w-full min-h-[100dvh] bg-background font-sans overflow-x-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {view === 'onboarding' ? (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Onboarding onStart={handleStart} onlineCount={onlineCount} />
          </motion.div>
        ) : (
          <motion.div
            key="room"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col p-4 md:p-6 gap-6 z-10 w-full"
          >
            {connectionState === 'searching' && (
              <MatchmakingScreen 
                onCancel={handleExit} 
                onlineCount={onlineCount} 
              />
            )}

            {/* Top Bar */}
            <header className="flex items-center justify-between z-20 px-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-bold text-white shadow-lg">M</div>
                <span className="font-bold text-xl tracking-tight text-white">MeetRandom</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Add Friend Button */}
                <AddFriendButton
                  state={connectionState}
                  friendRequested={friendRequested}
                  friendAccepted={friendAccepted}
                  onRequest={sendFriendRequest}
                />
                {/* Friend request received indicator */}
                {friendRequestReceived && !friendAccepted && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30 text-accent text-xs font-semibold"
                  >
                    💜 Wants to connect!
                  </motion.div>
                )}
                <button 
                  onClick={handleExit}
                  className="px-4 py-2 rounded-full glass text-sm font-medium hover:bg-white/10 transition-colors"
                >
                  Exit Room
                </button>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row gap-6 pb-[100px] lg:pb-0 h-full relative">
              
              {/* Video Layout */}
              <div className="flex-1 flex flex-col sm:flex-row gap-4 lg:gap-6 relative h-[60vh] lg:h-auto">
                {/* Remote Video (Full Size) */}
                <div className="w-full h-full relative lg:flex-[7] rounded-3xl overflow-hidden border-glow shadow-2xl">
                  <VideoCard 
                    stream={remoteStream} 
                    isLocal={false} 
                    state={connectionState} 
                    onPiPRef={handlePiPRef}
                    partnerMeta={partnerMeta}
                  />
                </div>
                
                {/* Local Video (Floating or Side) */}
                <motion.div 
                  drag
                  dragConstraints={{ left: -300, right: 0, top: 0, bottom: 300 }}
                  className="absolute top-4 right-4 w-32 md:w-48 aspect-[3/4] z-30 cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden shadow-2xl border border-white/20"
                >
                  <VideoCard 
                    stream={localStream} 
                    isLocal={true} 
                    state={connectionState} 
                    muted={!micEnabled}
                    isScreenSharing={isScreenSharing}
                  />
                </motion.div>
              </div>

              {/* Chat Panel */}
              <div className="w-full h-[400px] lg:h-auto lg:flex-[3] flex-shrink-0 z-20">
                <ChatPanel 
                  messages={messages}
                  onSend={sendMessage}
                  onChange={(val) => sendTyping(val.length > 0)}
                  isTyping={isTyping}
                  state={connectionState}
                  onIcebreaker={handleIcebreaker}
                />
              </div>

            </main>

            <FloatingDock 
              onNext={handleNext}
              onStop={handleStop}
              onReport={() => alert('User reported.')}
              camEnabled={camEnabled}
              micEnabled={micEnabled}
              toggleCam={handleToggleCam}
              toggleMic={handleToggleMic}
              switchCamera={switchCamera}
              state={connectionState}
              // New props
              onSettings={() => setShowEffectsPanel(true)}
              onReactions={() => setShowReactionPicker(!showReactionPicker)}
              onGames={() => setShowMiniGame(true)}
              onPiP={togglePiP}
              onScreenShare={handleScreenShare}
              isScreenSharing={isScreenSharing}
              isPiP={isPiP}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Overlays ──────────────────────────────────────────────── */}

      {/* Floating Reactions */}
      <FloatingReactions 
        reactions={reactions} 
        onRemove={removeFloatingReaction} 
      />

      {/* Reaction Picker */}
      <ReactionPicker
        isOpen={showReactionPicker}
        onPick={handleReactionPick}
        onClose={() => setShowReactionPicker(false)}
      />

      {/* Video Effects Panel */}
      <VideoEffectsPanel
        isOpen={showEffectsPanel}
        onClose={() => setShowEffectsPanel(false)}
        voicePreset={voicePreset}
        setVoicePreset={setVoicePreset}
      />

      {/* Icebreaker Overlay */}
      <IcebreakerOverlay
        question={icebreakerQuestion}
        onClose={dismissIcebreaker}
      />

      {/* Mini Games */}
      <MiniGame
        isOpen={showMiniGame}
        onClose={() => setShowMiniGame(false)}
        tttBoard={tttBoard}
        tttIsMyTurn={tttIsMyTurn}
        tttMySymbol={tttMySymbol}
        tttWinner={tttWinner}
        onTTTMove={makeTTTMove}
        onTTTReset={resetTTT}
        wyrQuestion={wyrQuestion}
        wyrMyPick={wyrMyPick}
        wyrPartnerPick={wyrPartnerPick}
        onWYRPick={pickWYR}
        // Chess
        chessState={chessState}
        chessIsMyTurn={chessIsMyTurn}
        chessMyColor={chessMyColor}
        chessStatus={chessStatus}
        onChessMove={makeChessMove}
        onChessReset={resetChess}
        onStartGame={handleStartGame}
      />

      {/* Skip Reason Modal */}
      <SkipReasonModal
        isOpen={showSkipModal}
        onSelect={handleSkipWithReason}
        onSkip={handleSkipWithReason}
      />

      {/* Friend Connected Modal */}
      <FriendConnectedModal
        isOpen={showFriendModal}
        roomCode={friendRoomCode}
        onClose={() => setShowFriendModal(false)}
      />
    </div>
  );
}

export default App;
