// Social Media Visual Composer - Main Application

(function() {
    'use strict';

    // Platform configurations with default dimensions
    const platformConfig = {
        instagram: { width: 1080, height: 1080, color: '#e1306c', name: 'Instagram' },
        facebook: { width: 1200, height: 630, color: '#1877f2', name: 'Facebook' },
        linkedin: { width: 1200, height: 627, color: '#0a66c2', name: 'LinkedIn' }
    };

    // Application state
    let state = {
        image: null,
        imageX: 0,
        imageY: 0,
        zoom: 100,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        textLayers: [],
        textIdCounter: 0,
        isBold: false,
        isItalic: false
    };

    // DOM Elements
    const elements = {
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        editorSection: document.getElementById('editorSection'),
        mainCanvas: document.getElementById('mainCanvas'),
        zoomSlider: document.getElementById('zoomSlider'),
        zoomValue: document.getElementById('zoomValue'),
        resetBtn: document.getElementById('resetBtn'),
        newImageBtn: document.getElementById('newImageBtn'),
        textInput: document.getElementById('textInput'),
        fontFamily: document.getElementById('fontFamily'),
        fontSize: document.getElementById('fontSize'),
        textColor: document.getElementById('textColor'),
        strokeColor: document.getElementById('strokeColor'),
        strokeWidth: document.getElementById('strokeWidth'),
        boldBtn: document.getElementById('boldBtn'),
        italicBtn: document.getElementById('italicBtn'),
        addTextBtn: document.getElementById('addTextBtn'),
        textLayersUl: document.getElementById('textLayersUl'),
        downloadAllBtn: document.getElementById('downloadAllBtn'),
        instaWidth: document.getElementById('instaWidth'),
        instaHeight: document.getElementById('instaHeight'),
        fbWidth: document.getElementById('fbWidth'),
        fbHeight: document.getElementById('fbHeight'),
        linkedinWidth: document.getElementById('linkedinWidth'),
        linkedinHeight: document.getElementById('linkedinHeight'),
        instaPreview: document.getElementById('instaPreview'),
        fbPreview: document.getElementById('fbPreview'),
        linkedinPreview: document.getElementById('linkedinPreview')
    };

    // Initialize the application
    function init() {
        setupEventListeners();
    }

    // Setup all event listeners
    function setupEventListeners() {
        // File upload
        elements.dropZone.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', handleFileSelect);

        // Drag and drop
        elements.dropZone.addEventListener('dragover', handleDragOver);
        elements.dropZone.addEventListener('dragleave', handleDragLeave);
        elements.dropZone.addEventListener('drop', handleDrop);

        // Paste from clipboard
        document.addEventListener('paste', handlePaste);

        // Canvas interaction
        elements.mainCanvas.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Touch support for mobile
        elements.mainCanvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        document.addEventListener('touchmove', handleTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);

        // Zoom control
        elements.zoomSlider.addEventListener('input', handleZoomChange);

        // Reset button
        elements.resetBtn.addEventListener('click', resetImagePosition);

        // New image button
        elements.newImageBtn.addEventListener('click', resetApplication);

        // Text controls
        elements.boldBtn.addEventListener('click', () => toggleStyle('bold'));
        elements.italicBtn.addEventListener('click', () => toggleStyle('italic'));
        elements.addTextBtn.addEventListener('click', addTextLayer);
        elements.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTextLayer();
        });

        // Platform dimension changes
        const dimensionInputs = [
            elements.instaWidth, elements.instaHeight,
            elements.fbWidth, elements.fbHeight,
            elements.linkedinWidth, elements.linkedinHeight
        ];
        dimensionInputs.forEach(input => {
            input.addEventListener('change', updatePlatformDimensions);
        });

        // Download buttons
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', () => downloadImage(btn.dataset.platform));
        });
        elements.downloadAllBtn.addEventListener('click', downloadAll);
    }

    // File selection handler
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) loadImageFile(file);
    }

    // Drag over handler
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dropZone.classList.add('drag-over');
    }

    // Drag leave handler
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dropZone.classList.remove('drag-over');
    }

    // Drop handler
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dropZone.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            loadImageFile(files[0]);
        }
    }

    // Paste handler
    function handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith('image/')) {
                const file = items[i].getAsFile();
                if (file) {
                    loadImageFile(file);
                    e.preventDefault();
                    break;
                }
            }
        }
    }

    // Load image file
    function loadImageFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                state.image = img;
                resetImagePosition();
                showEditor();
                renderMainCanvas();
                renderAllPreviews();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // Show editor section
    function showEditor() {
        elements.dropZone.parentElement.classList.add('hidden');
        elements.editorSection.classList.remove('hidden');
    }

    // Reset to upload screen
    function resetApplication() {
        state = {
            image: null,
            imageX: 0,
            imageY: 0,
            zoom: 100,
            isDragging: false,
            dragStartX: 0,
            dragStartY: 0,
            textLayers: [],
            textIdCounter: 0,
            isBold: false,
            isItalic: false
        };
        elements.fileInput.value = '';
        elements.zoomSlider.value = 100;
        elements.zoomValue.textContent = '100%';
        elements.textLayersUl.innerHTML = '';
        elements.boldBtn.classList.remove('active');
        elements.italicBtn.classList.remove('active');
        elements.dropZone.parentElement.classList.remove('hidden');
        elements.editorSection.classList.add('hidden');
    }

    // Reset image position
    function resetImagePosition() {
        state.imageX = 0;
        state.imageY = 0;
        state.zoom = 100;
        elements.zoomSlider.value = 100;
        elements.zoomValue.textContent = '100%';
        if (state.image) {
            renderMainCanvas();
            renderAllPreviews();
        }
    }

    // Handle zoom change
    function handleZoomChange(e) {
        state.zoom = parseInt(e.target.value);
        elements.zoomValue.textContent = `${state.zoom}%`;
        renderMainCanvas();
        renderAllPreviews();
    }

    // Mouse/Touch interaction handlers
    function handleMouseDown(e) {
        if (!state.image) return;
        state.isDragging = true;
        state.dragStartX = e.clientX - state.imageX;
        state.dragStartY = e.clientY - state.imageY;
        elements.mainCanvas.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
        if (!state.isDragging) return;
        state.imageX = e.clientX - state.dragStartX;
        state.imageY = e.clientY - state.dragStartY;
        renderMainCanvas();
        renderAllPreviews();
    }

    function handleMouseUp() {
        state.isDragging = false;
        elements.mainCanvas.style.cursor = 'move';
    }

    function handleTouchStart(e) {
        if (!state.image) return;
        e.preventDefault();
        const touch = e.touches[0];
        state.isDragging = true;
        state.dragStartX = touch.clientX - state.imageX;
        state.dragStartY = touch.clientY - state.imageY;
    }

    function handleTouchMove(e) {
        if (!state.isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];
        state.imageX = touch.clientX - state.dragStartX;
        state.imageY = touch.clientY - state.dragStartY;
        renderMainCanvas();
        renderAllPreviews();
    }

    function handleTouchEnd() {
        state.isDragging = false;
    }

    // Update platform dimensions from inputs
    function updatePlatformDimensions() {
        platformConfig.instagram.width = parseInt(elements.instaWidth.value) || 1080;
        platformConfig.instagram.height = parseInt(elements.instaHeight.value) || 1080;
        platformConfig.facebook.width = parseInt(elements.fbWidth.value) || 1200;
        platformConfig.facebook.height = parseInt(elements.fbHeight.value) || 630;
        platformConfig.linkedin.width = parseInt(elements.linkedinWidth.value) || 1200;
        platformConfig.linkedin.height = parseInt(elements.linkedinHeight.value) || 627;

        renderMainCanvas();
        renderAllPreviews();
    }

    // Render main canvas with image and platform frames
    function renderMainCanvas() {
        if (!state.image) return;

        const canvas = elements.mainCanvas;
        const ctx = canvas.getContext('2d');

        // Calculate canvas size based on the largest platform dimensions
        const maxWidth = Math.max(
            platformConfig.instagram.width,
            platformConfig.facebook.width,
            platformConfig.linkedin.width
        );
        const maxHeight = Math.max(
            platformConfig.instagram.height,
            platformConfig.facebook.height,
            platformConfig.linkedin.height
        );

        // Scale down for display
        const displayScale = 0.5;
        canvas.width = maxWidth * displayScale;
        canvas.height = maxHeight * displayScale;

        // Clear canvas
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw image
        const scale = state.zoom / 100;
        const imgWidth = state.image.width * scale * displayScale;
        const imgHeight = state.image.height * scale * displayScale;
        const imgX = (canvas.width / 2) + (state.imageX * displayScale) - (imgWidth / 2);
        const imgY = (canvas.height / 2) + (state.imageY * displayScale) - (imgHeight / 2);

        ctx.drawImage(state.image, imgX, imgY, imgWidth, imgHeight);

        // Draw text layers
        drawTextLayers(ctx, displayScale, canvas.width, canvas.height);

        // Draw platform frames
        drawPlatformFrames(ctx, displayScale);
    }

    // Draw platform frames on canvas
    function drawPlatformFrames(ctx, scale) {
        const platforms = ['instagram', 'facebook', 'linkedin'];
        const lineStyles = [
            { dash: [], width: 3 },      // Instagram - solid
            { dash: [10, 5], width: 3 }, // Facebook - dashed
            { dash: [3, 3], width: 3 }   // LinkedIn - dotted
        ];

        platforms.forEach((platform, index) => {
            const config = platformConfig[platform];
            const frameWidth = config.width * scale;
            const frameHeight = config.height * scale;
            const x = (ctx.canvas.width - frameWidth) / 2;
            const y = (ctx.canvas.height - frameHeight) / 2;

            ctx.strokeStyle = config.color;
            ctx.lineWidth = lineStyles[index].width;
            ctx.setLineDash(lineStyles[index].dash);
            ctx.strokeRect(x, y, frameWidth, frameHeight);

            // Draw label
            ctx.fillStyle = config.color;
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.setLineDash([]);
            const labelText = `${config.name} (${config.width}x${config.height})`;
            const labelWidth = ctx.measureText(labelText).width + 10;
            ctx.fillRect(x, y - 22, labelWidth, 20);
            ctx.fillStyle = 'white';
            ctx.fillText(labelText, x + 5, y - 7);
        });

        ctx.setLineDash([]);
    }

    // Render all preview canvases
    function renderAllPreviews() {
        renderPreview('instagram', elements.instaPreview);
        renderPreview('facebook', elements.fbPreview);
        renderPreview('linkedin', elements.linkedinPreview);
    }

    // Render a single preview
    function renderPreview(platform, canvas) {
        if (!state.image) return;

        const ctx = canvas.getContext('2d');
        const config = platformConfig[platform];

        // Preview scale for display
        const maxPreviewSize = 300;
        const previewScale = Math.min(
            maxPreviewSize / config.width,
            maxPreviewSize / config.height
        );

        canvas.width = config.width * previewScale;
        canvas.height = config.height * previewScale;

        // Clear canvas
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate image position and size for this platform
        const scale = state.zoom / 100;
        const mainCanvasScale = 0.5; // Match the main canvas scale
        
        // Convert coordinates from main canvas space to preview space
        const platformOffsetX = (canvas.width / 2);
        const platformOffsetY = (canvas.height / 2);
        
        const imgWidth = state.image.width * scale * previewScale;
        const imgHeight = state.image.height * scale * previewScale;
        const imgX = platformOffsetX + (state.imageX * previewScale) - (imgWidth / 2);
        const imgY = platformOffsetY + (state.imageY * previewScale) - (imgHeight / 2);

        ctx.drawImage(state.image, imgX, imgY, imgWidth, imgHeight);

        // Draw text layers
        drawTextLayers(ctx, previewScale, canvas.width, canvas.height);
    }

    // Draw text layers
    function drawTextLayers(ctx, scale, canvasWidth, canvasHeight) {
        state.textLayers.forEach(layer => {
            const fontSize = layer.fontSize * scale;
            let fontStyle = '';
            if (layer.isItalic) fontStyle += 'italic ';
            if (layer.isBold) fontStyle += 'bold ';
            
            ctx.font = `${fontStyle}${fontSize}px "${layer.fontFamily}"`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const x = canvasWidth / 2 + (layer.x * scale);
            const y = canvasHeight / 2 + (layer.y * scale);

            // Draw stroke if specified
            if (layer.strokeWidth > 0) {
                ctx.strokeStyle = layer.strokeColor;
                ctx.lineWidth = layer.strokeWidth * scale;
                ctx.lineJoin = 'round';
                ctx.strokeText(layer.text, x, y);
            }

            // Draw fill
            ctx.fillStyle = layer.color;
            ctx.fillText(layer.text, x, y);
        });
    }

    // Toggle text style
    function toggleStyle(style) {
        if (style === 'bold') {
            state.isBold = !state.isBold;
            elements.boldBtn.classList.toggle('active');
        } else if (style === 'italic') {
            state.isItalic = !state.isItalic;
            elements.italicBtn.classList.toggle('active');
        }
    }

    // Add text layer
    function addTextLayer() {
        const text = elements.textInput.value.trim();
        if (!text) return;

        const layer = {
            id: ++state.textIdCounter,
            text: text,
            fontFamily: elements.fontFamily.value,
            fontSize: parseInt(elements.fontSize.value) || 48,
            color: elements.textColor.value,
            strokeColor: elements.strokeColor.value,
            strokeWidth: parseInt(elements.strokeWidth.value) || 0,
            isBold: state.isBold,
            isItalic: state.isItalic,
            x: 0,
            y: 0
        };

        state.textLayers.push(layer);
        updateTextLayersList();
        elements.textInput.value = '';

        renderMainCanvas();
        renderAllPreviews();
    }

    // Update text layers list UI
    function updateTextLayersList() {
        elements.textLayersUl.innerHTML = '';

        state.textLayers.forEach(layer => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="text-preview" style="font-family: '${layer.fontFamily}'; color: ${layer.color}; ${layer.isBold ? 'font-weight: bold;' : ''} ${layer.isItalic ? 'font-style: italic;' : ''}">
                    ${escapeHtml(layer.text)}
                </span>
                <div class="text-actions">
                    <button class="text-action-btn delete" data-id="${layer.id}">🗑️ Supprimer</button>
                </div>
            `;
            elements.textLayersUl.appendChild(li);
        });

        // Add delete event listeners
        document.querySelectorAll('.text-action-btn.delete').forEach(btn => {
            btn.addEventListener('click', () => deleteTextLayer(parseInt(btn.dataset.id)));
        });
    }

    // Delete text layer
    function deleteTextLayer(id) {
        state.textLayers = state.textLayers.filter(layer => layer.id !== id);
        updateTextLayersList();
        renderMainCanvas();
        renderAllPreviews();
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Download image for a specific platform
    function downloadImage(platform) {
        if (!state.image) return;

        const config = platformConfig[platform];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = config.width;
        canvas.height = config.height;

        // Draw background
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate image position and size
        const scale = state.zoom / 100;
        const imgWidth = state.image.width * scale;
        const imgHeight = state.image.height * scale;
        const imgX = (canvas.width / 2) + state.imageX - (imgWidth / 2);
        const imgY = (canvas.height / 2) + state.imageY - (imgHeight / 2);

        ctx.drawImage(state.image, imgX, imgY, imgWidth, imgHeight);

        // Draw text layers at full resolution
        drawTextLayers(ctx, 1, canvas.width, canvas.height);

        // Download
        const link = document.createElement('a');
        link.download = `${platform}-${config.width}x${config.height}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // Download all formats
    function downloadAll() {
        const platforms = ['instagram', 'facebook', 'linkedin'];
        platforms.forEach((platform, index) => {
            setTimeout(() => downloadImage(platform), index * 500);
        });
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
