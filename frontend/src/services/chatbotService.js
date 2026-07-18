import api from './api';

export const chatbotService = {
  async ask(message) {
    const { data } = await api.post('/chatbot/ask', { message });
    return data.reply;
  },
};