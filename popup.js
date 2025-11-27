class CookieManager {
  constructor() {
    this.currentUrl = ""
    this.selectedDomain = ""
    this.domainOptions = []
    this.cookies = []
    this.editingCookie = null
    this.init()
  }

  async init() {
    await this.getCurrentDomain()
    await this.loadCookies()
    this.bindEvents()
  }

  async getCurrentDomain() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab && tab.url) {
        this.currentUrl = tab.url
        const url = new URL(tab.url)
        const hostname = url.hostname

        this.domainOptions = this.generateDomainOptions(hostname)
        const parent = this.domainOptions.find((item) => item.level === 'parent');
        if (parent) {
          this.selectedDomain = parent.value;
        } else {
          this.selectedDomain = hostname;
        }

        this.updateDomainSelector()
      }
    } catch (error) {
      console.error("获取当前域名失败:", error)
      document.getElementById("domain-selector").innerHTML = '<option value="">无法获取域名</option>'
    }
  }

  generateDomainOptions(hostname) {
    const options = []
    const parts = hostname.split(".")

    // Add current hostname
    options.push({
      level: 'current',
      value: hostname,
      label: hostname,
      description: "当前域名",
    })

    // Generate parent domain options for subdomains
    if (parts.length > 2) {
      for (let i = 1; i < parts.length - 1; i++) {
        const parentDomain = "." + parts.slice(i).join(".")
        options.push({
          level: 'parent',
          value: parentDomain,
          label: parentDomain,
          description: "父域名 (包含子域名)",
        })
      }
    }

    // Add root domain option
    if (parts.length >= 2) {
      const rootDomain = "." + parts.slice(-2).join(".")
      if (!options.some((opt) => opt.value === rootDomain)) {
        options.push({
          level: 'root',
          value: rootDomain,
          label: rootDomain,
          description: "根域名 (包含所有子域名)",
        })
      }
    }

    return options
  }

  updateDomainSelector() {
    const selector = document.getElementById("domain-selector")
    selector.innerHTML = this.domainOptions
      .map(
        (option) =>
          `<option value="${option.value}" ${option.value === this.selectedDomain ? "selected" : ""}>
        ${option.label} ${option.description ? "(" + option.description + ")" : ""}
      </option>`,
      )
      .join("")
  }

  async loadCookies() {
    try {
      if (!this.selectedDomain) return

      let cookies
      if (this.selectedDomain.startsWith(".")) {
        // For parent domains, get all cookies for the domain and its subdomains
        cookies = await chrome.cookies.getAll({ domain: this.selectedDomain })
      } else {
        // For exact domains, get cookies for that specific domain
        cookies = await chrome.cookies.getAll({ domain: this.selectedDomain })
      }

      this.cookies = cookies
      this.renderCookies()
    } catch (error) {
      console.error("加载Cookie失败:", error)
      this.showError("加载Cookie失败")
    }
  }

  renderCookies(filteredCookies = null) {
    const cookieList = document.getElementById("cookie-list")
    const cookiesToRender = filteredCookies || this.cookies

    if (cookiesToRender.length === 0) {
      cookieList.innerHTML = `
        <div class="empty-state">
          <h3>🍪 暂无Cookie</h3>
          <p>当前域名下没有找到任何Cookie</p>
        </div>
      `
      return
    }

    cookieList.innerHTML = cookiesToRender
      .map(
        (cookie) => `
      <div class="cookie-item" data-name="${cookie.name}">
        <div class="cookie-header">
          <div class="cookie-name">${this.escapeHtml(cookie.name)}</div>
          <div class="cookie-actions">
            <button class="btn btn-secondary edit-cookie" data-name="${cookie.name}">编辑</button>
            <button class="btn btn-danger delete-cookie" data-name="${cookie.name}">删除</button>
          </div>
        </div>
        <div class="cookie-value">${this.escapeHtml(this.truncateText(cookie.value, 100))}</div>
        <div class="cookie-meta">
          <span>域名: ${cookie.domain}</span>
          <span>路径: ${cookie.path}</span>
          ${cookie.secure ? "<span>Secure</span>" : ""}
          ${cookie.httpOnly ? "<span>HttpOnly</span>" : ""}
          ${cookie.session ? "<span>Session</span>" : ""}
          ${cookie.expirationDate ? `<span>过期: ${new Date(cookie.expirationDate * 1000).toLocaleString()}</span>` : ""}
        </div>
      </div>
    `,
      )
      .join("")

    // 绑定编辑和删除事件
    cookieList.querySelectorAll(".edit-cookie").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cookieName = e.target.dataset.name
        this.editCookie(cookieName)
      })
    })

    cookieList.querySelectorAll(".delete-cookie").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const cookieName = e.target.dataset.name
        this.deleteCookie(cookieName)
      })
    })
  }

  bindEvents() {
    // 新增Cookie按钮
    document.getElementById("add-cookie").addEventListener("click", () => {
      this.showCookieModal()
    })

    // 清空所有Cookie按钮
    document.getElementById("clear-all").addEventListener("click", () => {
      this.clearAllCookies()
    })

    // 刷新按钮
    document.getElementById("refresh").addEventListener("click", () => {
      this.loadCookies()
    })

    // 搜索功能
    document.getElementById("search").addEventListener("input", (e) => {
      this.filterCookies(e.target.value)
    })

    // 模态框事件
    document.getElementById("save-cookie").addEventListener("click", () => {
      this.saveCookie()
    })

    document.getElementById("cancel-cookie").addEventListener("click", () => {
      this.hideCookieModal()
    })

    document.querySelector(".close").addEventListener("click", () => {
      this.hideCookieModal()
    })

    // Session Cookie复选框事件
    document.getElementById("cookie-session").addEventListener("change", (e) => {
      const expiresInput = document.getElementById("cookie-expires")
      expiresInput.disabled = e.target.checked
      if (e.target.checked) {
        expiresInput.value = ""
      }
    })

    // 点击模态框外部关闭
    document.getElementById("cookie-modal").addEventListener("click", (e) => {
      if (e.target.id === "cookie-modal") {
        this.hideCookieModal()
      }
    })

    document.getElementById("domain-selector").addEventListener("change", (e) => {
      this.selectedDomain = e.target.value
      this.loadCookies()
    })
  }

  filterCookies(searchTerm) {
    if (!searchTerm.trim()) {
      this.renderCookies()
      return
    }

    const filtered = this.cookies.filter(
      (cookie) =>
        cookie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cookie.value.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    this.renderCookies(filtered)
  }

  showCookieModal(cookie = null) {
    this.editingCookie = cookie
    const modal = document.getElementById("cookie-modal")
    const title = document.getElementById("modal-title")

    if (cookie) {
      title.textContent = "编辑Cookie"
      this.fillCookieForm(cookie)
    } else {
      title.textContent = "新增Cookie"
      this.resetCookieForm()
    }

    modal.style.display = "block"
  }

  hideCookieModal() {
    document.getElementById("cookie-modal").style.display = "none"
    this.editingCookie = null
  }

  fillCookieForm(cookie) {
    document.getElementById("cookie-name").value = cookie.name
    document.getElementById("cookie-value").value = cookie.value
    document.getElementById("cookie-domain").value = cookie.domain
    document.getElementById("cookie-path").value = cookie.path
    document.getElementById("cookie-secure").checked = cookie.secure
    document.getElementById("cookie-httponly").checked = cookie.httpOnly
    document.getElementById("cookie-session").checked = cookie.session
    document.getElementById("cookie-samesite").value = cookie.sameSite || "lax"

    if (cookie.expirationDate && !cookie.session) {
      const date = new Date(cookie.expirationDate * 1000)
      document.getElementById("cookie-expires").value = date.toISOString().slice(0, 16)
    }

    document.getElementById("cookie-expires").disabled = cookie.session
  }

  resetCookieForm() {
    document.getElementById("cookie-form").reset()
    document.getElementById("cookie-domain").value = this.selectedDomain
    document.getElementById("cookie-path").value = "/"
    document.getElementById("cookie-samesite").value = "lax"
    document.getElementById("cookie-expires").disabled = false
  }

  async saveCookie() {
    const form = document.getElementById("cookie-form")
    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const sameSiteValue = document.getElementById("cookie-samesite").value
    const sameSiteMapping = {
      no_restriction: "no_restriction",
      lax: "lax",
      strict: "strict",
      none: "no_restriction", // fallback mapping
      unspecified: "unspecified",
    }

    const cookieData = {
      name: document.getElementById("cookie-name").value.trim(),
      value: document.getElementById("cookie-value").value,
      domain: document.getElementById("cookie-domain").value.trim() || this.selectedDomain,
      path: document.getElementById("cookie-path").value.trim() || "/",
      secure: document.getElementById("cookie-secure").checked,
      httpOnly: document.getElementById("cookie-httponly").checked,
      sameSite: sameSiteMapping[sameSiteValue] || "lax", // Use mapped value with fallback
    }

    if (!cookieData.name) {
      this.showError("Cookie名称不能为空")
      return
    }

    // Validate cookie name format
    if (!/^[a-zA-Z0-9!#$&^_`|~-]+$/.test(cookieData.name)) {
      this.showError("Cookie名称包含无效字符。只允许字母、数字和特殊字符: !#$&^_`|~-")
      return
    }

    // 处理过期时间
    const isSession = document.getElementById("cookie-session").checked
    const expiresValue = document.getElementById("cookie-expires").value

    if (!isSession && expiresValue) {
      cookieData.expirationDate = Math.floor(new Date(expiresValue).getTime() / 1000)
    }

    try {
      // 如果是编辑模式，先删除原Cookie
      if (this.editingCookie) {
        await this.removeCookie(this.editingCookie.name, this.editingCookie.domain, this.editingCookie.path)
      }

      let targetDomain = cookieData.domain
      // Remove leading dot for URL construction
      if (targetDomain.startsWith(".")) {
        targetDomain = targetDomain.substring(1)
      }

      // Construct URL with proper protocol and domain
      const url = `http${cookieData.secure ? "s" : ""}://${targetDomain}${cookieData.path}`

      const cookieDetails = {
        url: url,
        name: cookieData.name,
        value: cookieData.value,
        path: cookieData.path,
        secure: cookieData.secure,
        httpOnly: cookieData.httpOnly,
        sameSite: cookieData.sameSite,
      }

      // Only set domain if it's different from the URL domain
      if (cookieData.domain !== targetDomain) {
        cookieDetails.domain = cookieData.domain
      }

      // Only set expiration if it's not a session cookie
      if (cookieData.expirationDate) {
        cookieDetails.expirationDate = cookieData.expirationDate
      }

      console.log("[v0] Setting cookie with details:", cookieDetails)

      // 设置新Cookie
      const result = await chrome.cookies.set(cookieDetails)

      if (!result) {
        throw new Error("Chrome cookies API返回了空结果")
      }

      console.log("[v0] Cookie set successfully:", result)

      this.hideCookieModal()
      await this.loadCookies()
      this.showSuccess(this.editingCookie ? "Cookie已更新" : "Cookie已添加")
    } catch (error) {
      console.error("[v0] 保存Cookie失败:", error)
      this.showError("保存Cookie失败: " + error.message)
    }
  }

  editCookie(cookieName) {
    const cookie = this.cookies.find((c) => c.name === cookieName)
    if (cookie) {
      this.showCookieModal(cookie)
    }
  }

  async deleteCookie(cookieName) {
    if (!confirm(`确定要删除Cookie "${cookieName}" 吗？`)) {
      return
    }

    try {
      const cookie = this.cookies.find((c) => c.name === cookieName)
      if (cookie) {
        await this.removeCookie(cookie.name, cookie.domain, cookie.path)
        await this.loadCookies()
        this.showSuccess("Cookie已删除")
      }
    } catch (error) {
      console.error("删除Cookie失败:", error)
      this.showError("删除Cookie失败")
    }
  }

  async clearAllCookies() {
    if (!confirm(`确定要清空域名 "${this.selectedDomain}" 下的所有Cookie吗？此操作不可撤销！`)) {
      return
    }

    try {
      const promises = this.cookies.map((cookie) => this.removeCookie(cookie.name, cookie.domain, cookie.path))

      await Promise.all(promises)
      await this.loadCookies()
      this.showSuccess(`已清空 ${promises.length} 个Cookie`)
    } catch (error) {
      console.error("清空Cookie失败:", error)
      this.showError("清空Cookie失败")
    }
  }

  async removeCookie(name, domain, path) {
    let targetDomain = domain
    if (targetDomain.startsWith(".")) {
      targetDomain = targetDomain.substring(1)
    }

    const httpUrl = `http://${targetDomain}${path}`
    const httpsUrl = `https://${targetDomain}${path}`

    try {
      await chrome.cookies.remove({ url: httpUrl, name })
    } catch (error) {
      console.log("[v0] HTTP removal failed:", error.message)
    }

    try {
      await chrome.cookies.remove({ url: httpsUrl, name })
    } catch (error) {
      console.log("[v0] HTTPS removal failed:", error.message)
    }
  }

  showSuccess(message) {
    this.showNotification(message, "success")
  }

  showError(message) {
    this.showNotification(message, "error")
  }

  showNotification(message, type) {
    // 创建通知元素
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      background: ${type === "success" ? "#4CAF50" : "#f44336"};
    `

    document.body.appendChild(notification)

    // 3秒后自动移除
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 3000)
  }

  escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }
}

// 添加CSS动画
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`
document.head.appendChild(style)

// 初始化Cookie管理器
document.addEventListener("DOMContentLoaded", () => {
  new CookieManager()
})
