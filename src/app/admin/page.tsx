'use client';

import { useState, useEffect } from 'react';

interface Character {
  id: number;
  nickname: string;
  realName: string;
  avatar: string;
  persona: string;
  createdAt: string;
  moments?: Moment[];
}

interface Moment {
  id: number;
  characterId: number;
  content: string | null;
  mediaType: 'image' | 'video' | 'text' | null;
  mediaUrl: string | null;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export default function AdminPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    realName: '',
    avatar: '',
    persona: '',
  });
  const [momentContents, setMomentContents] = useState<{ content: string; mediaType: string; mediaUrl: string }[]>([]);

  // Chat state
  const [currentConversation, setCurrentConversation] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'characters' | 'chat'>('characters');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    const res = await fetch('/api/characters');
    const data = await res.json();
    setCharacters(data);
  };

  const resetForm = () => {
    setFormData({ nickname: '', realName: '', avatar: '', persona: '' });
    setMomentContents([]);
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          momentContents: momentContents.filter(m => m.content || m.mediaUrl),
        }),
      });

      if (res.ok) {
        resetForm();
        fetchCharacters();
      }
    } catch (error) {
      console.error('Error creating character:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (character: Character) => {
    setEditingId(character.id);
    setFormData({
      nickname: character.nickname,
      realName: character.realName,
      avatar: character.avatar,
      persona: character.persona,
    });

    // Fetch moments for this character
    try {
      const res = await fetch(`/api/characters/${character.id}`);
      const data = await res.json();
      if (data.moments && data.moments.length > 0) {
        setMomentContents(data.moments.map((m: Moment) => ({
          content: m.content || '',
          mediaType: m.mediaType || 'text',
          mediaUrl: m.mediaUrl || '',
        })));
      } else {
        setMomentContents([]);
      }
    } catch (error) {
      console.error('Error fetching moments:', error);
      setMomentContents([]);
    }

    setShowAddForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/characters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          ...formData,
          moments: momentContents.filter(m => m.content || m.mediaUrl),
        }),
      });

      if (res.ok) {
        resetForm();
        fetchCharacters();
      }
    } catch (error) {
      console.error('Error updating character:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个角色吗？')) return;

    await fetch(`/api/characters?id=${id}`, { method: 'DELETE' });
    fetchCharacters();
  };

  const startConversation = async (characterId: number) => {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterId }),
    });
    const data = await res.json();
    setCurrentConversation(data.conversationId);
    setChatMessages([]);
    setSelectedCharacter(data.character);
    setActiveTab('chat');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversation,
          content: inputMessage,
        }),
      });
      const data = await res.json();

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        createdAt: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formDataUpload,
    });
    const data = await res.json();
    setFormData(prev => ({ ...prev, avatar: data.url }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Portal - 角色管理系统</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('characters')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'characters' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            角色管理
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
          >
            聊天测试
          </button>
        </div>

        {/* Character Management Tab */}
        {activeTab === 'characters' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">角色列表</h2>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                添加角色
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {editingId ? '编辑角色' : '添加新角色'}
                </h3>
                <form onSubmit={editingId ? handleUpdate : handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">昵称</label>
                    <input
                      type="text"
                      value={formData.nickname}
                      onChange={e => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">本名</label>
                    <input
                      type="text"
                      value={formData.realName}
                      onChange={e => setFormData(prev => ({ ...prev, realName: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">形象图片</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="w-full"
                    />
                    {formData.avatar && (
                      <img src={formData.avatar} alt="Avatar preview" className="mt-2 w-24 h-24 object-cover rounded" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">人设</label>
                    <textarea
                      value={formData.persona}
                      onChange={e => setFormData(prev => ({ ...prev, persona: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg h-32"
                      placeholder="描述角色的性格、背景、说话风格等..."
                      required
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">朋友圈内容（可选）</h4>
                    {momentContents.map((moment, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <select
                          value={moment.mediaType}
                          onChange={e => {
                            const newMoments = [...momentContents];
                            newMoments[index].mediaType = e.target.value;
                            setMomentContents(newMoments);
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="text">文字</option>
                          <option value="image">图片</option>
                          <option value="video">视频</option>
                        </select>
                        <input
                          type="text"
                          placeholder="内容"
                          value={moment.content}
                          onChange={e => {
                            const newMoments = [...momentContents];
                            newMoments[index].content = e.target.value;
                            setMomentContents(newMoments);
                          }}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setMomentContents(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-500"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setMomentContents(prev => [...prev, { content: '', mediaType: 'text', mediaUrl: '' }])}
                      className="text-blue-600 text-sm"
                    >
                      + 添加朋友圈
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isLoading ? '保存中...' : '保存'}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border rounded-lg"
                    >
                      取消
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {characters.map(char => (
                <div key={char.id} className="bg-white rounded-lg shadow p-4">
                  <img
                    src={char.avatar}
                    alt={char.nickname}
                    className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
                  />
                  <h3 className="text-lg font-semibold text-center">{char.nickname}</h3>
                  <p className="text-gray-500 text-center text-sm">{char.realName}</p>
                  <p className="mt-2 text-gray-600 text-sm line-clamp-3">{char.persona}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => startConversation(char.id)}
                      className="flex-1 px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      开始聊天
                    </button>
                    <button
                      onClick={() => handleEdit(char)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => handleDelete(char.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow h-[600px] flex">
            {/* Character Selection */}
            <div className="w-1/3 border-r p-4 overflow-y-auto">
              <h3 className="font-semibold mb-4">选择角色开始对话</h3>
              {characters.map(char => (
                <div
                  key={char.id}
                  onClick={() => startConversation(char.id)}
                  className={`p-3 rounded-lg cursor-pointer mb-2 flex items-center gap-3 ${currentConversation && selectedCharacter?.id === char.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                >
                  <img src={char.avatar} alt={char.nickname} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="font-medium">{char.nickname}</p>
                    <p className="text-sm text-gray-500">{char.realName}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {currentConversation && selectedCharacter ? (
                <>
                  <div className="p-4 border-b flex items-center gap-3">
                    <img src={selectedCharacter.avatar} alt={selectedCharacter.nickname} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{selectedCharacter.nickname}</p>
                      <p className="text-sm text-gray-500">{selectedCharacter.realName}</p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatMessages.length === 0 ? (
                      <p className="text-gray-500 text-center mt-10">开始发送消息聊天吧</p>
                    ) : (
                      chatMessages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] p-3 rounded-lg ${
                              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 p-3 rounded-lg">正在思考...</div>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={e => setInputMessage(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && sendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      发送
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  请选择一个角色开始对话
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
