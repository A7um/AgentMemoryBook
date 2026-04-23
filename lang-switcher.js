(function () {
    var base = "/AgentMemoryBook/";
    var path = window.location.pathname;

    var isZh = path.indexOf(base + "zh/") === 0;
    var currentLang = isZh ? "zh" : "en";
    var relPath = isZh
        ? path.substring((base + "zh/").length)
        : path.substring(base.length);

    var enUrl = base + relPath;
    var zhUrl = base + "zh/" + relPath;

    var switcher = document.createElement("div");
    switcher.className = "lang-switcher";
    switcher.innerHTML =
        '<a href="' + enUrl + '"' + (currentLang === "en" ? ' class="active"' : "") + ">EN</a>" +
        "<span>|</span>" +
        '<a href="' + zhUrl + '"' + (currentLang === "zh" ? ' class="active"' : "") + ">中文</a>";

    document.body.appendChild(switcher);
})();
