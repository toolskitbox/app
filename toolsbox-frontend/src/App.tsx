import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { useTheme } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

// Tool Category Pages
import MediaToolsPage from './pages/tools/MediaToolsPage';
import TextToolsPage from './pages/tools/TextToolsPage';
import WebToolsPage from './pages/tools/WebToolsPage';
import DevToolsPage from './pages/tools/DevToolsPage';
import UtilityToolsPage from './pages/tools/UtilityToolsPage';

// Individual Tool Pages
// Media Tools
import VideoDownloaderPage from './pages/tools/media/VideoDownloaderPage';
import AudioConverterPage from './pages/tools/media/AudioConverterPage';
import ImageToolsPage from './pages/tools/media/ImageToolsPage';
import VideoConverterPage from './pages/tools/media/VideoConverterPage';
import ImageResizerPage from './pages/tools/media/ImageResizerPage';
import ImageConverterPage from './pages/tools/media/ImageConverterPage';

// Text Tools
import FileConverterPage from './pages/tools/text/FileConverterPage';
import StringToolsPage from './pages/tools/text/StringToolsPage';
import CaseConverterPage from './pages/tools/text/CaseConverterPage';
import WordCounterPage from './pages/tools/text/WordCounterPage';
import DiffViewerPage from './pages/tools/text/DiffViewerPage';
import BinaryConverterPage from './pages/tools/text/BinaryConverterPage';
import StylishTextPage from './pages/tools/text/StylishTextPage';
import JwtGeneratorPage from './pages/tools/text/JwtGeneratorPage';

// Web Tools
import QrCodePage from './pages/tools/web/QrCodePage';
import UrlShortenerPage from './pages/tools/web/UrlShortenerPage';
import IpLookupPage from './pages/tools/web/IpLookupPage';
import MetaTagGeneratorPage from './pages/tools/web/MetaTagGeneratorPage';
import UrlEncoderPage from './pages/tools/web/UrlEncoderPage';
import SlugGeneratorPage from './pages/tools/web/SlugGeneratorPage';
import TempEmailPage from './pages/tools/web/TempEmailPage';
import OnlineNotepadPage from './pages/tools/web/OnlineNotepadPage';

// Dev Tools
import RegexToolPage from './pages/tools/dev/RegexToolPage';
import JsonXmlConverterPage from './pages/tools/dev/JsonXmlConverterPage';
import Base64ConverterPage from './pages/tools/dev/Base64ConverterPage';

// Utility Tools
import UnitConverterPage from './pages/tools/utility/UnitConverterPage';
import PasswordToolsPage from './pages/tools/utility/PasswordToolsPage';
import TimestampConverterPage from './pages/tools/utility/TimestampConverterPage';
import TimeZoneConverterPage from './pages/tools/utility/TimeZoneConverterPage';
import DateCalculatorPage from './pages/tools/utility/DateCalculatorPage';
import AgeCalculatorPage from './pages/tools/utility/AgeCalculatorPage';
import TypingTestPage from './pages/tools/utility/TypingTestPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { theme } = useTheme();
  
  return (
    <>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        {/* Login page as standalone page without any layout */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Other routes with MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          
          {/* Protected Routes */}
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          {/* Tool Category Routes */}
          <Route path="tools">
            <Route path="media" element={
              <ProtectedRoute>
                <MediaToolsPage />
              </ProtectedRoute>
            } />
            <Route path="text" element={
              <ProtectedRoute>
                <TextToolsPage />
              </ProtectedRoute>
            } />
            <Route path="web" element={
              <ProtectedRoute>
                <WebToolsPage />
              </ProtectedRoute>
            } />
            <Route path="dev" element={
              <ProtectedRoute>
                <DevToolsPage />
              </ProtectedRoute>
            } />
            <Route path="utility" element={
              <ProtectedRoute>
                <UtilityToolsPage />
              </ProtectedRoute>
            } />
            
            {/* Individual Tool Routes */}
            {/* Media Tools */}
            <Route path="media/video-downloader" element={
              <ProtectedRoute>
                <VideoDownloaderPage />
              </ProtectedRoute>
            } />
            <Route path="media/audio-converter" element={
              <ProtectedRoute>
                <AudioConverterPage />
              </ProtectedRoute>
            } />
            <Route path="media/image-tools" element={
              <ProtectedRoute>
                <ImageToolsPage />
              </ProtectedRoute>
            } />
            <Route path="media/image-resizer" element={
              <ProtectedRoute>
                <ImageResizerPage />
              </ProtectedRoute>
            } />
            <Route path="media/image-converter" element={
              <ProtectedRoute>
                <ImageConverterPage />
              </ProtectedRoute>
            } />
            <Route path="media/video-converter" element={
              <ProtectedRoute>
                <VideoConverterPage />
              </ProtectedRoute>
            } />
            
            {/* Text Tools */}
            <Route path="text/file-converter" element={
              <ProtectedRoute>
                <FileConverterPage />
              </ProtectedRoute>
            } />
            <Route path="text/string-tools" element={
              <ProtectedRoute>
                <StringToolsPage />
              </ProtectedRoute>
            } />
            <Route path="text/case-converter" element={
              <ProtectedRoute>
                <CaseConverterPage />
              </ProtectedRoute>
            } />
            <Route path="text/word-counter" element={
              <ProtectedRoute>
                <WordCounterPage />
              </ProtectedRoute>
            } />
            <Route path="text/diff-viewer" element={
              <ProtectedRoute>
                <DiffViewerPage />
              </ProtectedRoute>
            } />
            <Route path="text/binary-converter" element={
              <ProtectedRoute>
                <BinaryConverterPage />
              </ProtectedRoute>
            } />
            <Route path="text/stylish-text" element={
              <ProtectedRoute>
                <StylishTextPage />
              </ProtectedRoute>
            } />
            <Route path="text/jwt-generator" element={
              <ProtectedRoute>
                <JwtGeneratorPage />
              </ProtectedRoute>
            } />
            
            {/* Web Tools */}
            <Route path="web/qr-code" element={
              <ProtectedRoute>
                <QrCodePage />
              </ProtectedRoute>
            } />
            <Route path="web/url-shortener" element={
              <ProtectedRoute>
                <UrlShortenerPage />
              </ProtectedRoute>
            } />
            <Route path="web/ip-lookup" element={
              <ProtectedRoute>
                <IpLookupPage />
              </ProtectedRoute>
            } />
            <Route path="web/meta-tag-generator" element={
              <ProtectedRoute>
                <MetaTagGeneratorPage />
              </ProtectedRoute>
            } />
            <Route path="web/url-encoder" element={
              <ProtectedRoute>
                <UrlEncoderPage />
              </ProtectedRoute>
            } />
            <Route path="web/slug-generator" element={
              <ProtectedRoute>
                <SlugGeneratorPage />
              </ProtectedRoute>
            } />
            <Route path="web/temp-email" element={
              <ProtectedRoute>
                <TempEmailPage />
              </ProtectedRoute>
            } />
            <Route path="web/online-notepad" element={
              <ProtectedRoute>
                <OnlineNotepadPage />
              </ProtectedRoute>
            } />
            
            {/* Dev Tools */}
            <Route path="dev/regex-tool" element={
              <ProtectedRoute>
                <RegexToolPage />
              </ProtectedRoute>
            } />
            <Route path="dev/json-xml-converter" element={
              <ProtectedRoute>
                <JsonXmlConverterPage />
              </ProtectedRoute>
            } />
            <Route path="dev/base64-converter" element={
              <ProtectedRoute>
                <Base64ConverterPage />
              </ProtectedRoute>
            } />
            
            {/* Utility Tools */}
            <Route path="utility/unit-converter" element={
              <ProtectedRoute>
                <UnitConverterPage />
              </ProtectedRoute>
            } />
            <Route path="utility/password-tools" element={
              <ProtectedRoute>
                <PasswordToolsPage />
              </ProtectedRoute>
            } />
            <Route path="utility/timestamp-converter" element={
              <ProtectedRoute>
                <TimestampConverterPage />
              </ProtectedRoute>
            } />
            <Route path="utility/timezone-converter" element={
              <ProtectedRoute>
                <TimeZoneConverterPage />
              </ProtectedRoute>
            } />
            <Route path="utility/date-calculator" element={
              <ProtectedRoute>
                <DateCalculatorPage />
              </ProtectedRoute>
            } />
            <Route path="utility/age-calculator" element={
              <ProtectedRoute>
                <AgeCalculatorPage />
              </ProtectedRoute>
            } />
            <Route path="utility/typing-test" element={
              <ProtectedRoute>
                <TypingTestPage />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
