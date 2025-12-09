import { ControlComponent, ControlType } from '../../../../dataset/enum/Control'
import { hitCheckbox, hitRadio } from '../mousedown'
import { CanvasEvent } from '../../CanvasEvent'

// Handle checkbox/radio toggle with Enter or Space
// 处理使用回车或空格键切换复选框/单选框
export function toggleCheckboxRadio(evt: KeyboardEvent, host: CanvasEvent): boolean {
  const draw = host.getDraw()
  const control = draw.getControl()
  const activeControl = control.getActiveControl()
  
  if (!activeControl || !control.getIsRangeWithinControl()) {
    return false
  }
  
  const elementList = draw.getElementList()
  const { startIndex } = draw.getRange().getRange()
  const element = elementList[startIndex]
  
  if (!element.controlId) {
    return false
  }
  
  const controlElement = activeControl.getElement()
  if (
    controlElement.control?.type !== ControlType.CHECKBOX &&
    controlElement.control?.type !== ControlType.RADIO
  ) {
    return false
  }
  
  // Search nearest checkbox/radio (left then right)
  // 搜索最近的复选框/单选框（先左后右）
  let checkIndex = startIndex
  let foundElement: typeof elementList[0] | null = null
  
  // Search left / 向左搜索
  while (checkIndex >= 0) {
    const el = elementList[checkIndex]
    if (el.controlId !== element.controlId) break
    if (
      el.controlComponent === ControlComponent.CHECKBOX ||
      el.controlComponent === ControlComponent.RADIO
    ) {
      foundElement = el
      break
    }
    checkIndex--
  }
  
  // If not found left, search right / 左边未找到，向右搜索
  if (!foundElement) {
    checkIndex = startIndex + 1
    while (checkIndex < elementList.length) {
      const el = elementList[checkIndex]
      if (el.controlId !== element.controlId) break
      if (
        el.controlComponent === ControlComponent.CHECKBOX ||
        el.controlComponent === ControlComponent.RADIO
      ) {
        foundElement = el
        break
      }
      checkIndex++
    }
  }
  
  // Toggle found checkbox/radio / 切换找到的复选框/单选框
  if (foundElement) {
    if (foundElement.controlComponent === ControlComponent.CHECKBOX) {
      hitCheckbox(foundElement, draw)
    } else {
      hitRadio(foundElement, draw)
    }
    evt.preventDefault()
    return true
  }
  
  return false
}
