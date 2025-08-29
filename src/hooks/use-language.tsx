
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useLocalStorage } from './use-local-storage';

const translations = {
  en: {
    nav: {
      myNotes: 'My Inspirations',
      checklist: 'Checklist',
      settings: 'Settings',
      newInspiration: 'New Inspiration',
      newChecklist: 'New Checklist',
    },
    titles: {
        myNotes: 'My Inspirations',
        newNote: 'New Note',
        editNote: 'Edit Note',
        checklist: 'Behavior Checklist',
        settings: 'Settings',
    },
    noteList: {
      title: 'Inspiration Wall',
      newNoteButton: 'New Note',
      empty: {
        title: 'Your inspiration wall is empty',
        description: 'Start by creating a new inspiration to capture your ideas.',
        createButton: 'Create First Inspiration',
      },
    },
    noteCard: {
        updatedOn: 'Updated on',
        aria: {
            edit: 'Edit note'
        }
    },
    checklist: {
      title: 'Behavior Checklist',
      description: 'Use this checklist to reflect on your actions and decisions before acting.',
      placeholder: 'Add a new checklist item...',
      aria: {
        addItem: 'Add item',
        deleteItem: 'Delete item',
      },
      empty: {
        title: 'You have no checklists',
        description: 'Start by creating a new checklist to track your goals.',
        createButton: 'Create First Checklist',
      },
    },
    apiKeyInput: {
      title: 'API Keys',
      description: 'To use AI-powered features, you need to provide your own API keys. Keys are stored only in your browser\'s local storage.',
      saveButton: 'Save Key',
      aria: {
        show: 'Show API key',
        hide: 'Hide API key',
      },
      gemini: {
        label: 'Google Gemini API Key',
        placeholder: 'Enter your Gemini API key',
        alert: {
            title: 'Where to get a Gemini API Key?',
            description: 'You can get a free Gemini API key from Google AI Studio.',
            link: 'Get your key here.',
        },
      },
      deepseek: {
        label: 'DeepSeek API Key',
        placeholder: 'Enter your DeepSeek API key',
        alert: {
            title: 'Where to get a DeepSeek API Key?',
            description: 'You can get a free DeepSeek API key from the DeepSeek Platform.',
            link: 'Get your key here.',
        },
      },
      toast: {
        title: 'API Key Saved',
        gemini: 'Your Gemini API key has been saved locally.',
        deepseek: 'Your DeepSeek API key has been saved locally.',
      },
      alert: {
        footerTitle: 'Privacy Note',
        footer: 'Your API keys are stored only in your browser\'s local storage and are never sent to our servers.',
      }
    },
    themeSwitcher: {
        label: 'Theme',
        light: 'Light',
        dark: 'Dark'
    },
    languageSwitcher: {
        label: 'Language',
        placeholder: 'Select a language'
    },
    categories: {
        inspiration: 'Inspiration',
        checklist: 'Checklist'
    },
    noteEditor: {
        backButton: 'Back',
        category: {
            label: 'Category',
        },
        title: {
            label: 'Title',
            placeholder: 'My awesome idea'
        },
        content: {
            label: 'Content',
            placeholder: 'Describe your thoughts in detail...'
        },
        tags: {
            label: 'Tags',
            placeholder: 'Type a tag and press Enter',
            suggestButton: 'Suggest'
        },
        aiTools: {
            provider: 'Provider',
            model: 'Model'
        },
        refineButton: 'Refine with AI',
        exportButton: 'Export',
        deleteButton: 'Delete',
        saveButton: 'Save',
        deleteDialog: {
            title: 'Are you absolutely sure?',
            description: 'This action cannot be undone. This will permanently delete your note.',
            cancel: 'Cancel',
            continue: 'Continue'
        },
        toast: {
            notFound: {
                title: 'Note not found',
                description: 'The requested note could not be found.',
            },
            empty: {
                title: 'Empty fields',
                description: 'Please provide a title and content for your note.',
            },
            updated: {
                title: 'Note Updated',
                description: 'Your changes have been saved.',
            },
            created: {
                title: 'Note Created',
                description: 'Your new note has been saved.',
            },
            deleted: {
                title: 'Note Deleted',
                description: 'The note has been permanently deleted.',
            },
            apiKey: {
                title: 'API Key Required',
                description: 'Please set the required API key in Settings to use this AI feature.',
            },
            tagsSuggested: {
                title: 'Tags Suggested',
                description: 'AI has suggested new tags for your note.',
            },
            noteRefined: {
                title: 'Note Refined',
                description: 'AI has refined your note content.',
            },
            aiError: {
                title: 'AI Error',
                tags: 'Could not suggest tags. Check your API key and try again.',
                refine: 'Could not refine the note. Check your API key and try again.',
            }
        }
    }
  },
  zh: {
    nav: {
      myNotes: '我的灵感',
      checklist: '核对清单',
      settings: '设置',
      newInspiration: '新灵感',
      newChecklist: '新清单',
    },
    titles: {
        myNotes: '我的灵感',
        newNote: '新笔记',
        editNote: '编辑笔记',
        checklist: '行为核对清单',
        settings: '设置',
    },
    noteList: {
      title: '灵感墙',
      newNoteButton: '新笔记',
      empty: {
        title: '你的灵感墙是空的',
        description: '从创建新灵感开始，捕捉你的想法。',
        createButton: '创建第一条灵感',
      },
    },
    noteCard: {
        updatedOn: '更新于',
        aria: {
            edit: '编辑笔记'
        }
    },
    checklist: {
      title: '行为核对清单',
      description: '在行动前，使用此清单反思您的行为和决定。',
      placeholder: '添加新的清单项目...',
      aria: {
        addItem: '添加项目',
        deleteItem: '删除项目',
      },
      empty: {
        title: '你还没有任何清单',
        description: '从创建一个新清单开始，追踪你的目标。',
        createButton: '创建第一个清单',
      },
    },
    apiKeyInput: {
      title: 'API 密钥',
      description: '要使用人工智能功能，您需要提供自己的 API 密钥。密钥仅存储在您浏览器的本地存储中。',
      saveButton: '保存密钥',
      aria: {
        show: '显示 API 密钥',
        hide: '隐藏 API 密钥',
      },
      gemini: {
        label: 'Google Gemini API 密钥',
        placeholder: '输入您的 Gemini API 密钥',
        alert: {
            title: '从哪里获取 Gemini API 密钥？',
            description: '您可以从 Google AI Studio 免费获取 Gemini API 密钥。',
            link: '在此处获取您的密钥。',
        },
      },
      deepseek: {
        label: 'DeepSeek API 密钥',
        placeholder: '输入您的 DeepSeek API 密钥',
        alert: {
            title: '从哪里获取 DeepSeek API 密钥？',
            description: '您可以从 DeepSeek 开放平台免费获取 API 密钥。',
            link: '在此处获取您的密钥。',
        },
      },
      toast: {
        title: 'API 密钥已保存',
        gemini: '您的 Gemini API 密钥已保存在本地。',
        deepseek: '您的 DeepSeek API 密钥已保存在本地。',
      },
      alert: {
        footerTitle: '隐私提示',
        footer: '您的 API 密钥仅存储在您浏览器的本地存储中，绝不会发送到我们的服务器。',
      }
    },
    themeSwitcher: {
        label: '主题',
        light: '浅色',
        dark: '深色'
    },
    languageSwitcher: {
        label: '语言',
        placeholder: '选择语言'
    },
    categories: {
        inspiration: '灵感',
        checklist: '清单'
    },
    noteEditor: {
        backButton: '返回',
        category: {
            label: '类别',
        },
        title: {
            label: '标题',
            placeholder: '我的绝妙想法'
        },
        content: {
            label: '内容',
            placeholder: '详细描述您的想法...'
        },
        tags: {
            label: '标签',
            placeholder: '输入标签并按 Enter',
            suggestButton: '建议'
        },
        aiTools: {
            provider: '服务商',
            model: '模型'
        },
        refineButton: '使用 AI 优化',
        exportButton: '导出',
        deleteButton: '删除',
        saveButton: '保存',
        deleteDialog: {
            title: '您确定吗？',
            description: '此操作无法撤销。这将永久删除您的笔记。',
            cancel: '取消',
            continue: '继续'
        },
        toast: {
            notFound: {
                title: '找不到笔记',
                description: '找不到所请求的笔记。',
            },
            empty: {
                title: '字段为空',
                description: '请为您的笔记提供标题和内容。',
            },
            updated: {
                title: '笔记已更新',
                description: '您的更改已保存。',
            },
            created: {
                title: '笔记已创建',
                description: '您的新笔记已保存。',
            },
            deleted: {
                title: '笔记已删除',
                description: '笔记已被永久删除。',
            },
            apiKey: {
                title: '需要 API 密钥',
                description: '请在“设置”中设置所需的 API 密钥以使用此 AI 功能。',
            },
            tagsSuggested: {
                title: '建议的标签',
                description: 'AI 为您的笔记建议了新标签。',
            },
            noteRefined: {
                title: '笔记已优化',
                description: 'AI 已优化您的笔记内容。',
            },
            aiError: {
                title: 'AI 错误',
                tags: '无法建议标签。请检查您的 API 密钥并重试。',
                refine: '无法优化笔记。请检查您的 API 密钥并重试。',
            }
        }
    }
  },
};

type Language = 'en' | 'zh';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  isClient: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t = (key: string) => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result[k];
      if (!result) {
        // Fallback to English if translation not found
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult[fk];
            if (!fallbackResult) return key;
        }
        return fallbackResult;
      }
    }
    return result || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isClient }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
