import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts() {
  function handleKeydown(event: KeyboardEvent) {
    // Ctrl/Cmd + N: New card
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault()
      // Emit event or call store action
      console.log('New card')
    }

    // Ctrl/Cmd + B: New board
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault()
      console.log('New board')
    }

    // Ctrl/Cmd + L: New list
    if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
      event.preventDefault()
      console.log('New list')
    }

    // Ctrl/Cmd + F: Focus search
    if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
      event.preventDefault()
      const searchInput = document.querySelector('.search-box input') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }

    // Escape: Close dialogs
    if (event.key === 'Escape') {
      // Close any open modals
      console.log('Close dialogs')
    }

    // Delete: Delete selected item
    if (event.key === 'Delete') {
      console.log('Delete selected')
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
}
