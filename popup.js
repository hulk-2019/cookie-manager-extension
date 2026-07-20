const locales = {
  en: {
    title: "Cookie Manager",
    addCookie: "+ Add Cookie",
    importCookies: "Import Cookies",
    clearAll: "Clear All",
    refresh: "Refresh",
    searchPlaceholder: "Search cookies...",
    loading: "Loading cookies...",
    emptyStateTitle: "No Cookies Found",
    emptyStateDesc: "No cookies found for this domain",
    modalAddTitle: "Add Cookie",
    modalEditTitle: "Edit Cookie",
    modalImportTitle: "Batch Import Cookies",
    name: "Name",
    value: "Value",
    domain: "Domain",
    path: "Path",
    expiration: "Expiration",
    secure: "Secure",
    httpOnly: "HttpOnly",
    session: "Session Cookie",
    sameSite: "SameSite",
    save: "Save",
    cancel: "Cancel",
    import: "Import",
    successAdd: "Cookie added successfully",
    successEdit: "Cookie updated successfully",
    successDelete: "Cookie deleted successfully",
    successClear: "All cookies cleared",
    successImport: "Cookies imported successfully",
    errorLoad: "Failed to load cookies",
    errorSave: "Failed to save cookie",
    errorDelete: "Failed to delete cookie",
    errorClear: "Failed to clear cookies",
    errorImport: "Failed to import cookies",
    confirmDelete: "Are you sure you want to delete cookie '{name}'?",
    confirmClear: "Are you sure you want to clear all cookies for domain '{domain}'?",
    invalidJson: "Invalid JSON format",
    domainCurrent: "Current Domain",
    domainParent: "Parent Domain (including subdomains)",
    domainRoot: "Root Domain (including all subdomains)",
    edit: "Edit",
    delete: "Delete",
    langSwitch: "中文 / EN"
  },
  zh: {
    title: "Cookie管理小工具",
    addCookie: "+ 新增Cookie",
    importCookies: "批量导入",
    clearAll: "清空所有",
    refresh: "刷新",
    searchPlaceholder: "搜索Cookie名称...",
    loading: "正在加载Cookie...",
    emptyStateTitle: "暂无Cookie",
    emptyStateDesc: "当前域名下没有找到任何Cookie",
    modalAddTitle: "新增Cookie",
    modalEditTitle: "编辑Cookie",
    modalImportTitle: "批量导入Cookie",
    name: "名称",
    value: "值",
    domain: "域名",
    path: "路径",
    expiration: "过期时间",
    secure: "Secure",
    httpOnly: "HttpOnly",
    session: "Session Cookie",
    sameSite: "SameSite",
    save: "保存",
    cancel: "取消",
    import: "导入",
    successAdd: "Cookie已添加",
    successEdit: "Cookie已更新",
    successDelete: "Cookie已删除",
    successClear: "已清空所有Cookie",
    successImport: "Cookie导入成功",
    errorLoad: "加载Cookie失败",
    errorSave: "保存Cookie失败",
    errorDelete: "删除Cookie失败",
    errorClear: "清空Cookie失败",
    errorImport: "导入Cookie失败",
    confirmDelete: "确定要删除Cookie '{name}' 吗？",
    confirmClear: "确定要清空域名 '{domain}' 下的所有Cookie吗？",
    invalidJson: "JSON格式无效",
    domainCurrent: "当前域名",
    domainParent: "父域名 (包含子域名)",
    domainRoot: "根域名 (包含所有子域名)",
    edit: "编辑",
    delete: "删除",
    langSwitch: "English / 中文"
  }
};

class CookieManager {
  constructor() {
    this.currentUrl = ""
    this.selectedDomain = ""
    this.domainOptions = []
    this.cookies = []
    this.editingCookie = null
    this.currentLang = 'en' // Default to English
    this.init()
  }

  async init() {
    this.loadLanguage()
    this.initI18n()
    await this.getCurrentDomain()
    await this.loadCookies()
    this.bindEvents()
  }

  loadLanguage() {
    const savedLang = localStorage.getItem('cookieManagerLang')
    if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
      this.currentLang = savedLang
    }
  }

  saveLanguage(lang) {
    this.currentLang = lang
    localStorage.setItem('cookieManagerLang', lang)
    this.initI18n()
    this.renderCookies()
    this.updateDomainSelector() // Re-render domain selector to update labels
  }

  t(key, params = {}) {
    let text = locales[this.currentLang][key] || key
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v)
    }
    return text
  }

  initI18n() {
    // 让 datetime-local 等原生控件的界面文案(日期格式、选择框文字)跟随当前语言
    document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en'
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n')
      if (locales[this.currentLang][key]) {
        el.textContent = locales[this.currentLang][key]
      }
    })
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder')
      if (locales[this.currentLang][key]) {
        el.placeholder = locales[this.currentLang][key]
      }
    })
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
      document.getElementById("domain-selector").innerHTML = '<option value="">' + this.t('errorLoad') + '</option>'
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
      descriptionKey: "domainCurrent",
    })

    // Generate parent domain options for subdomains
    if (parts.length > 2) {
      for (let i = 1; i < parts.length - 1; i++) {
        const parentDomain = "." + parts.slice(i).join(".")
        options.push({
          level: 'parent',
          value: parentDomain,
          label: parentDomain,
          descriptionKey: "domainParent",
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
          descriptionKey: "domainRoot",
        })
      }
    }

    return options
  }

  updateDomainSelector() {
    const selector = document.getElementById("domain-selector")
    selector.innerHTML = this.domainOptions
      .map(
        (option) => {
          const desc = this.t(option.descriptionKey)
          return `<option value="${option.value}" ${option.value === this.selectedDomain ? "selected" : ""}>
        ${option.label} ${desc ? "(" + desc + ")" : ""}
      </option>`
        }
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
      this.showError(this.t('errorLoad'))
    }
  }

  renderCookies(filteredCookies = null) {
    const cookieList = document.getElementById("cookie-list")
    const cookiesToRender = filteredCookies || this.cookies

    if (cookiesToRender.length === 0) {
      cookieList.innerHTML = `
        <div class="empty-state">
          <h3>🍪 ${this.t('emptyStateTitle')}</h3>
          <p>${this.t('emptyStateDesc')}</p>
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
            <button class="btn btn-secondary edit-cookie" data-name="${cookie.name}">${this.t('edit')}</button>
            <button class="btn btn-danger delete-cookie" data-name="${cookie.name}">${this.t('delete')}</button>
          </div>
        </div>
        <div class="cookie-value">${this.escapeHtml(this.truncateText(cookie.value, 100))}</div>
        <div class="cookie-meta">
          <span>${this.t('domain')}: ${cookie.domain}</span>
          <span>${this.t('path')}: ${cookie.path}</span>
          ${cookie.secure ? `<span>${this.t('secure')}</span>` : ""}
          ${cookie.httpOnly ? `<span>${this.t('httpOnly')}</span>` : ""}
          ${cookie.session ? `<span>${this.t('session')}</span>` : ""}
          ${cookie.expirationDate ? `<span>${this.t('expiration')}: ${new Date(cookie.expirationDate * 1000).toLocaleString()}</span>` : ""}
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
    // Language Toggle
    document.getElementById("lang-toggle").addEventListener("click", () => {
      const newLang = this.currentLang === 'en' ? 'zh' : 'en'
      this.saveLanguage(newLang)
    })

    // Import Events
    document.getElementById("import-cookies").addEventListener("click", () => {
        this.showImportModal()
    })

    document.getElementById("do-import").addEventListener("click", () => {
        this.importCookies()
    })

    document.getElementById("cancel-import").addEventListener("click", () => {
        this.hideImportModal()
    })

    document.querySelector(".close-import").addEventListener("click", () => {
        this.hideImportModal()
    })


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
    window.addEventListener("click", (e) => {
      if (e.target.id === "cookie-modal") {
        this.hideCookieModal()
      }
      if (e.target.id === "import-modal") {
          this.hideImportModal()
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
      title.textContent = this.t('modalEditTitle')
      this.fillCookieForm(cookie)
    } else {
      title.textContent = this.t('modalAddTitle')
      this.resetCookieForm()
    }

    modal.style.display = "block"
  }

  hideCookieModal() {
    document.getElementById("cookie-modal").style.display = "none"
    this.editingCookie = null
  }

  showImportModal() {
      document.getElementById("import-modal").style.display = "block"
      document.getElementById("import-json").value = ""
  }

  hideImportModal() {
      document.getElementById("import-modal").style.display = "none"
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
      // Format to YYYY-MM-DDThh:mm for datetime-local input
      // Adjust for timezone offset
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      document.getElementById("cookie-expires").value = localDate.toISOString().slice(0, 16);
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
      this.showError(this.t('errorSave') + ": Cookie Name is required")
      return
    }
    
    // Process expiration
    const isSession = document.getElementById("cookie-session").checked
    const expiresValue = document.getElementById("cookie-expires").value

    if (!isSession && expiresValue) {
      cookieData.expirationDate = Math.floor(new Date(expiresValue).getTime() / 1000)
    }
    
    // Add session logic
    cookieData.session = isSession;

    try {
      await this.setCookie(cookieData)
      this.hideCookieModal()
      await this.loadCookies()
      this.showSuccess(this.editingCookie ? this.t('successEdit') : this.t('successAdd'))
    } catch (error) {
      console.error("[v0] 保存Cookie失败:", error)
      this.showError(this.t('errorSave') + ": " + error.message)
    }
  }

  async importCookies() {
      const jsonText = document.getElementById("import-json").value.trim();
      if (!jsonText) return;

      try {
          const cookies = JSON.parse(jsonText);
          if (!Array.isArray(cookies)) {
              throw new Error("Input must be a JSON array");
          }

          let successCount = 0;
          const errors = [];

          for (const cookie of cookies) {
              try {
                  // Basic validation
                  if (!cookie.name || cookie.value === undefined) {
                      throw new Error(`Missing name or value for cookie: ${JSON.stringify(cookie)}`);
                  }
                  
                  // Use defaults if missing
                  const cookieData = {
                      name: cookie.name,
                      value: cookie.value,
                      domain: cookie.domain || this.selectedDomain,
                      path: cookie.path || "/",
                      secure: cookie.secure !== undefined ? cookie.secure : true,
                      httpOnly: cookie.httpOnly !== undefined ? cookie.httpOnly : true,
                      sameSite: cookie.sameSite || "lax",
                      session: cookie.session !== undefined ? cookie.session : false
                  };

                  if (cookie.expirationDate) {
                      cookieData.expirationDate = cookie.expirationDate;
                  }

                  await this.setCookie(cookieData);
                  successCount++;
              } catch (e) {
                  console.error("Import error for cookie:", cookie, e);
                  errors.push(`${cookie.name}: ${e.message}`);
              }
          }

          this.hideImportModal();
          await this.loadCookies();
          
          if (errors.length > 0) {
              this.showError(`Imported ${successCount}/${cookies.length}. Errors: ${errors.join(", ")}`);
          } else {
              this.showSuccess(this.t('successImport') + ` (${successCount})`);
          }

      } catch (e) {
          this.showError(this.t('invalidJson') + ": " + e.message);
      }
  }

  async setCookie(cookieData) {
      let targetDomain = cookieData.domain
      // Remove leading dot for URL construction to ensure valid URL
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

      // Only set domain if it's explicitly provided and different (or same) as url
      // Chrome API requires domain to match or be a superdomain
      if (cookieData.domain) {
          cookieDetails.domain = cookieData.domain;
      }

      // Only set expiration if it's not a session cookie
      if (cookieData.expirationDate && !cookieData.session) {
        cookieDetails.expirationDate = cookieData.expirationDate
      }
      
      // If editing, remove old one first if name changed or if it just helps clean up
      if (this.editingCookie && this.editingCookie.name !== cookieData.name) {
           await this.removeCookie(this.editingCookie.name, this.editingCookie.domain, this.editingCookie.path);
      }

      const result = await chrome.cookies.set(cookieDetails)

      if (!result) {
          // Check for last error
          if (chrome.runtime.lastError) {
               throw new Error(chrome.runtime.lastError.message);
          }
          throw new Error("Chrome cookies API returned null");
      }
      return result;
  }

  editCookie(cookieName) {
    const cookie = this.cookies.find((c) => c.name === cookieName)
    if (cookie) {
      this.showCookieModal(cookie)
    }
  }

  async deleteCookie(cookieName) {
    if (!confirm(this.t('confirmDelete', {name: cookieName}))) {
      return
    }

    try {
      const cookie = this.cookies.find((c) => c.name === cookieName)
      if (cookie) {
        await this.removeCookie(cookie.name, cookie.domain, cookie.path)
        await this.loadCookies()
        this.showSuccess(this.t('successDelete'))
      }
    } catch (error) {
      console.error("删除Cookie失败:", error)
      this.showError(this.t('errorDelete'))
    }
  }

  async clearAllCookies() {
    if (!confirm(this.t('confirmClear', {domain: this.selectedDomain}))) {
      return
    }

    try {
      const promises = this.cookies.map((cookie) => this.removeCookie(cookie.name, cookie.domain, cookie.path))

      await Promise.all(promises)
      await this.loadCookies()
      this.showSuccess(this.t('successClear'))
    } catch (error) {
      console.error("清空Cookie失败:", error)
      this.showError(this.t('errorClear'))
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
