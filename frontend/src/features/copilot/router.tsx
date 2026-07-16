import { Navigate, Route, Routes } from 'react-router-dom';

import { AppLayout } from './layout/AppLayout';
import { CopilotWorkspacePage } from './pages/CopilotWorkspacePage';
import { ProductsPage } from './pages/ProductsPage';
import { SettingsPage } from './pages/SettingsPage';
import { CopilotWorkspaceProvider } from './session/CopilotWorkspaceProvider';

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/copilot" replace />} />
        <Route element={<CopilotWorkspaceProvider />}>
          <Route path="copilot" element={<CopilotWorkspacePage />} />
          <Route path="copilot/c/:conversationId" element={<CopilotWorkspacePage />} />
        </Route>
        <Route path="products" element={<ProductsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
