// Rising bubble animation for underwater background aesthetic
(function () {
    const canvas = document.getElementById('bubbles');
    const ctx = canvas.getContext('2d');
    let bubbles = [];
    const COUNT = 55;   // number of bubbles
    let count = COUNT;


    window.addEventListener('resize', WindowResize);

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        count = (canvas.width / 1920) * COUNT;
    }

    function WindowResize() {
        resize();
        bubbles = [];
        for (let i = 0; i < count; i++) {
            bubbles.push(createBubble());
        }
    }
    //creates bubbles with random properties
    function createBubble(atBottom = false) {
        const r = Math.random() * 18 + 4;
        return {
            x: Math.random() * canvas.width,
            y: atBottom ? canvas.height + r : Math.random() * canvas.height,
            r,
            speedY: -(Math.random() * 0.6 + 0.2), // negative = upward
            wobbleSpeed: (Math.random() - 0.5) * 0.012,
            wobbleOffset: Math.random() * Math.PI * 2,
            opacity: Math.random() * 0.25 + 0.08,
            tick: Math.random() * 1000,
        };
    }

    // initializes bubble array and sets canvas size
    function init() {
        resize();
        bubbles = [];
        for (let i = 0; i < COUNT; i++) {
            bubbles.push(createBubble(false));
        }
    }

    //animation loop
    function draw() {
        // clear canvas each frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // update and draw each bubble
        for (const b of bubbles) {
            b.tick++;
            b.x += Math.sin(b.tick * b.wobbleSpeed + b.wobbleOffset) * 0.4;
            b.y += b.speedY;

            const grd = ctx.createRadialGradient(
                b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.05,
                b.x, b.y, b.r
            );

            grd.addColorStop(0, `rgba(220, 255, 255, ${b.opacity * 1.6})`);
            grd.addColorStop(0.4, `rgba(100, 210, 240, ${b.opacity})`);
            grd.addColorStop(1, `rgba(30, 130, 180, ${b.opacity * 0.3})`);

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(180, 240, 255, ${b.opacity * 0.6})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            if (b.y < -b.r * 2) {
                Object.assign(b, createBubble(true));
            }
        }

        // loops animation when the browser is ready to draw the next frame
        requestAnimationFrame(draw);
    }
    window.addEventListener('resize', resize);
    init();
    draw();
})();
