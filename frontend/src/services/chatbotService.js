import api from './api';

export const chatbotService = {
  async ask(message, history = [], lang = 'en-US') {
    const { data } = await api.post('/ai/chat', { message, history, lang });
    return data.reply;
  },
};