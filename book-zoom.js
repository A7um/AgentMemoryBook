// Click-to-zoom lightbox for Mermaid diagrams and content images (mdBook).

(() => {
    'use strict';

    const LIGHTBOX_CLASS = 'amba-img-lightbox';
    const INNER_CLASS = 'amba-img-lightbox-inner';

    function closeLightbox() {
        document.querySelectorAll('.' + LIGHTBOX_CLASS).forEach((el) => el.remove());
        document.body.style.overflow = '';
    }

    function stripElementIds(root) {
        root.querySelectorAll('[id]').forEach((node) => {
            node.removeAttribute('id');
        });
    }

    function openLightboxFromMermaid(sourceEl) {
        const wrap = document.createElement('div');
        wrap.className = LIGHTBOX_CLASS;
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-modal', 'true');
        wrap.setAttribute('aria-label', 'Diagram (enlarged)');

        const inner = document.createElement('div');
        inner.className = INNER_CLASS;
        inner.addEventListener('click', (e) => e.stopPropagation());

        const clone = sourceEl.cloneNode(true);
        stripElementIds(clone);
        inner.appendChild(clone);

        const hint = document.createElement('div');
        hint.className = 'amba-img-lightbox-hint';
        hint.textContent = 'Esc or outside click to close';
        inner.appendChild(hint);

        wrap.appendChild(inner);
        wrap.addEventListener('click', closeLightbox);
        document.body.appendChild(wrap);
        document.body.style.overflow = 'hidden';
    }

    function openLightboxFromImage(img) {
        const wrap = document.createElement('div');
        wrap.className = LIGHTBOX_CLASS;
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-modal', 'true');
        wrap.setAttribute('aria-label', 'Image (enlarged)');

        const inner = document.createElement('div');
        inner.className = INNER_CLASS;
        inner.addEventListener('click', (e) => e.stopPropagation());

        const full = document.createElement('img');
        full.src = img.currentSrc || img.src;
        full.alt = img.alt || '';
        if (img.srcset) {
            full.srcset = img.srcset;
            full.sizes = '96vw';
        }
        inner.appendChild(full);

        const hint = document.createElement('div');
        hint.className = 'amba-img-lightbox-hint';
        hint.textContent = 'Esc or outside click to close';
        inner.appendChild(hint);

        wrap.appendChild(inner);
        wrap.addEventListener('click', closeLightbox);
        document.body.appendChild(wrap);
        document.body.style.overflow = 'hidden';
    }

    function onContentClick(e) {
        const content = e.currentTarget;
        if (!(content instanceof HTMLElement)) {
            return;
        }

        const mermaidRoot = e.target.closest('.mermaid');
        if (mermaidRoot && content.contains(mermaidRoot) && mermaidRoot.querySelector('svg')) {
            e.preventDefault();
            e.stopPropagation();
            openLightboxFromMermaid(mermaidRoot);
            return;
        }

        const img = e.target.closest('img');
        if (!img || !content.contains(img)) {
            return;
        }

        if (img.closest('.' + LIGHTBOX_CLASS)) {
            return;
        }

        // Skip UI chrome if images ever appear there
        if (img.closest('#mdbook-menu-bar, #mdbook-sidebar, .sidebar')) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        openLightboxFromImage(img);
    }

    function bindContent(content) {
        if (!content || content.dataset.ambaZoomBound === '1') {
            return;
        }
        content.dataset.ambaZoomBound = '1';
        content.addEventListener('click', onContentClick);
    }

    function init() {
        const content = document.querySelector('.content');
        bindContent(content);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    const content = document.querySelector('.content');
    if (content) {
        const observer = new MutationObserver(() => {
            bindContent(document.querySelector('.content'));
        });
        observer.observe(content, { childList: true, subtree: true });
    }
})();
