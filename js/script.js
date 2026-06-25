let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
};

document.querySelectorAll('.image-slider img').forEach(images => {
    images.onclick = () => {
        var src = images.getAttribute('src');
        document.querySelector('.main-home-image').src = src;
    };
});

// Manual horizontal memories track (draggable + arrow controls)
(function () {
    const memTrack = document.querySelector('.memories-track');
    const btnPrev = document.querySelector('.mem-prev');
    const btnNext = document.querySelector('.mem-next');
    const cards = memTrack ? Array.from(memTrack.querySelectorAll('.mem-box')) : [];
    if (!memTrack || cards.length === 0) return;

    let isDragging = false;
    let isTouchActive = false;
    let startX = 0;
    let scrollStart = 0;
    let scrollSnapTimeout = null;

    const getGap = () => {
        const style = window.getComputedStyle(memTrack);
        return parseFloat(style.gap || style.columnGap) || 0;
    };

    const getCardWidth = () => {
        const first = cards[0];
        const gap = getGap();
        return Math.round(first.getBoundingClientRect().width + gap);
    };

    const getClosestIndex = () => {
        const center = memTrack.scrollLeft + memTrack.clientWidth / 2;
        let closest = 0;
        let minDistance = Infinity;
        cards.forEach((card, index) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const distance = Math.abs(cardCenter - center);
            if (distance < minDistance) {
                minDistance = distance;
                closest = index;
            }
        });
        return closest;
    };

    const setActiveCard = () => {
        const activeIndex = getClosestIndex();
        cards.forEach((card, index) => {
            card.classList.toggle('active', index === activeIndex);
        });
    };

    const snapToClosest = () => {
        const center = memTrack.scrollLeft + memTrack.clientWidth / 2;
        let closestCard = cards[0];
        let closestDistance = Infinity;
        cards.forEach((card) => {
            const cardCenter = card.offsetLeft + card.offsetWidth / 2;
            const distance = Math.abs(cardCenter - center);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestCard = card;
            }
        });
        if (!closestCard) return;
        const target = Math.max(0, Math.round(closestCard.offsetLeft + closestCard.offsetWidth / 2 - memTrack.clientWidth / 2));
        memTrack.scrollTo({ left: target, behavior: 'smooth' });
        requestAnimationFrame(setActiveCard);
    };

    const scrollByCard = (direction) => {
        memTrack.scrollBy({ left: getCardWidth() * direction, behavior: 'smooth' });
        setTimeout(setActiveCard, 250);
    };

    const endDrag = () => {
        if (isDragging) {
            isDragging = false;
            updateDraggingState();
            memTrack.style.scrollBehavior = 'smooth';
            snapToClosest();
        }
        if (isTouchActive) {
            isTouchActive = false;
            memTrack.style.scrollBehavior = 'smooth';
            clearTimeout(scrollSnapTimeout);
            scrollSnapTimeout = setTimeout(snapToClosest, 220);
        }
    };

    const updateDraggingState = () => {
        memTrack.classList.toggle('is-dragging', isDragging);
    };

    btnNext?.addEventListener('click', () => scrollByCard(1));
    btnPrev?.addEventListener('click', () => scrollByCard(-1));

    memTrack.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if (event.pointerType === 'touch') {
            isTouchActive = true;
            memTrack.style.scrollBehavior = 'auto';
            return;
        }

        isDragging = true;
        startX = event.clientX;
        scrollStart = memTrack.scrollLeft;
        memTrack.style.scrollBehavior = 'auto';
        memTrack.setPointerCapture(event.pointerId);
        updateDraggingState();
    });

    memTrack.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        event.preventDefault();
        const delta = event.clientX - startX;
        memTrack.scrollLeft = scrollStart - delta;
    });

    memTrack.addEventListener('pointerup', endDrag);
    memTrack.addEventListener('pointercancel', endDrag);
    memTrack.addEventListener('pointerleave', endDrag);

    memTrack.addEventListener('scroll', () => {
        clearTimeout(scrollSnapTimeout);
        scrollSnapTimeout = setTimeout(snapToClosest, 240);
    }, { passive: true });

    window.addEventListener('resize', snapToClosest);
    window.addEventListener('load', () => {
        setTimeout(() => {
            snapToClosest();
            setActiveCard();
        }, 200);
    });
})();

// Add captions and lightbox modal for memories
(() => {
    const memBoxes = document.querySelectorAll('.mem-box');
    if (!memBoxes || memBoxes.length === 0) return;

    // set index on each box (no captions on cards)
    memBoxes.forEach((box, i) => {
        box.setAttribute('data-index', i);
    });

    // build modal
    const modal = document.createElement('div');
    modal.className = 'mem-modal';
    modal.innerHTML = `
        <div class="mem-modal-inner">
            <button class="mem-modal-close" aria-label="Close">×</button>
            <button class="mem-modal-prev" aria-label="Previous">&#10094;</button>
            <div class="mem-modal-content"><img src="" alt=""/></div>
            <button class="mem-modal-next" aria-label="Next">&#10095;</button>
            <div class="mem-modal-caption"></div>
        </div>
    `;
    document.body.appendChild(modal);

    const modalImg = modal.querySelector('.mem-modal-content img');
    const modalCap = modal.querySelector('.mem-modal-caption');
    const btnClose = modal.querySelector('.mem-modal-close');
    const btnPrevM = modal.querySelector('.mem-modal-prev');
    const btnNextM = modal.querySelector('.mem-modal-next');

    let current = 0;

    function openModal(index) {
        current = index;
        const src = memBoxes[current].querySelector('img').src;
        const alt = memBoxes[current].querySelector('img').alt || '';
        modalImg.src = src;
        modalImg.alt = alt;
        modalCap.textContent = alt;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        btnClose.focus();
    }

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    function prevModal() { openModal((current - 1 + memBoxes.length) % memBoxes.length); }
    function nextModal() { openModal((current + 1) % memBoxes.length); }

    memBoxes.forEach(box => box.addEventListener('click', (e) => {
        const idx = parseInt(box.getAttribute('data-index'), 10) || 0;
        openModal(idx);
    }));

    btnClose.addEventListener('click', closeModal);
    btnPrevM.addEventListener('click', (e) => { e.stopPropagation(); prevModal(); });
    btnNextM.addEventListener('click', (e) => { e.stopPropagation(); nextModal(); });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (!modal.classList.contains('open')) return;
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft') prevModal();
        if (e.key === 'ArrowRight') nextModal();
    });
})();



