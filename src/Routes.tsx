import {
  AddTelegramChatPage,
  ChannelPage,
  ChatAddFailurePage,
  ChatAddSuccessPage,
  MainPage,
  NewConditionPage,
} from '@pages'
import { Route, Routes } from 'react-router-dom'

export const ROUTES_NAME = {
  MAIN: '/',
  ADD_TELEGRAM_CHAT: '/admin/add-telegram-chat',
  CHAT_ADD_SUCCESS: '/admin/chat-add-success',
  CHAT_ADD_FAILURE: '/admin/chat-add-failure',
  CHANNEL: '/admin/channel/:channelSlug',
  CHANNEL_CONDITION: '/admin/channel/:channelSlug/condition/:conditionId',
}

export default (
  <Routes>
    <Route path={ROUTES_NAME.MAIN} element={<MainPage />} />
    <Route
      path={ROUTES_NAME.ADD_TELEGRAM_CHAT}
      element={<AddTelegramChatPage />}
    />
    <Route
      path={ROUTES_NAME.CHAT_ADD_SUCCESS}
      element={<ChatAddSuccessPage />}
    />
    <Route
      path={ROUTES_NAME.CHAT_ADD_FAILURE}
      element={<ChatAddFailurePage />}
    />
    <Route path={ROUTES_NAME.CHANNEL} element={<ChannelPage />} />
    <Route
      path={ROUTES_NAME.CHANNEL_CONDITION}
      element={<NewConditionPage />}
    />
  </Routes>
)
