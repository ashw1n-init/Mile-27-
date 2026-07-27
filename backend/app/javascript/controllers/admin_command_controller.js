import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["dialog", "input", "item", "empty"]

  connect() {
    this.handleShortcut = this.handleShortcut.bind(this)
    window.addEventListener("keydown", this.handleShortcut)
  }

  disconnect() {
    window.removeEventListener("keydown", this.handleShortcut)
  }

  handleShortcut(event) {
    const editable = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) || event.target.isContentEditable
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault()
      this.open()
    } else if (!editable && event.key === "/") {
      event.preventDefault()
      this.open()
    }
  }

  open() {
    if (!this.dialogTarget.open) this.dialogTarget.showModal()
    requestAnimationFrame(() => this.inputTarget.focus())
  }

  close() {
    this.dialogTarget.close()
    this.inputTarget.value = ""
    this.filter()
  }

  closeOnBackdrop(event) {
    if (event.target === this.dialogTarget) this.close()
  }

  filter() {
    const query = this.inputTarget.value.trim().toLowerCase()
    let visible = 0

    this.itemTargets.forEach((item) => {
      const match = item.textContent.toLowerCase().includes(query)
      item.hidden = !match
      if (match) visible += 1
    })

    this.emptyTarget.hidden = visible > 0
  }
}
