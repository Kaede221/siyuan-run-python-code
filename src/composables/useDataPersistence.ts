import { SaveWidgetData, GetWidgetData } from '@/utils/siyuan_client'

export function useDataPersistence() {
  const saveData = async (data: {
    code: string
    finishedTime: string
    costSeconds: number
    result: string
    matplotlibDiv: string
    canvasImages: Record<string, string>
    editorHeight: number
  }) => {
    await SaveWidgetData(data)
  }

  const loadData = async () => {
    return await GetWidgetData()
  }

  return {
    saveData,
    loadData,
  }
}
