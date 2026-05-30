import { create } from 'zustand'

type Template = 'cyberpunk' | 'minimal' | 'y2k'

interface TemplateStore {
  selected: Template
  setTemplate: (t: Template) => void
}

export const useTemplateStore = create<TemplateStore>((set) => ({
  selected: 'cyberpunk',
  setTemplate: (selected) => set({ selected }),
}))
