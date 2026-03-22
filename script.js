// Initialize Lucide Icons
lucide.createIcons();

// ============================================================
// 3D BACKGROUND — Three.js
// ============================================================
(function() {
    const canvas = document.querySelector('#bg-canvas');
    if (!canvas) return;

    const scene    = new THREE.Scene();
    const W = window.innerWidth, H = window.innerHeight;
    const camera   = new THREE.PerspectiveCamera(65, W/H, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.set(0, 0, 30);
    scene.fog = new THREE.FogExp2(0x000000, 0.012);

    // Lights
    scene.add(new THREE.AmbientLight(0x00ff80, 0.1));
    const pl1 = new THREE.PointLight(0x00ff80, 4, 120);
    pl1.position.set(-20, 30, 20);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x00ffaa, 2.5, 90);
    pl2.position.set(25, -20, 5);
    scene.add(pl2);

    const green = 0x00ff80, cyan = 0x00ffcc;
    const wireMat  = (op=0.07, col=green) => new THREE.MeshBasicMaterial({ color:col, wireframe:true, transparent:true, opacity:op });
    const lineMat  = (op=0.12, col=green) => new THREE.LineBasicMaterial({ color:col, transparent:true, opacity:op });
    const pointMat = (sz=0.1, op=0.35, col=green) => new THREE.PointsMaterial({ size:sz, color:col, transparent:true, opacity:op, sizeAttenuation:true });

    // 1. TORUS KNOT — main hero shape
    const tk = new THREE.Mesh(new THREE.TorusKnotGeometry(10, 1.8, 220, 18), wireMat(0.065));
    scene.add(tk);

    // 2. INNER TORUS KNOT
    const tk2 = new THREE.Mesh(new THREE.TorusKnotGeometry(6, 0.9, 140, 12, 3, 5), wireMat(0.05, cyan));
    scene.add(tk2);

    // 3. ICOSAHEDRON centre
    const ico = new THREE.Mesh(new THREE.IcosahedronGeometry(4.5, 1), wireMat(0.07));
    scene.add(ico);

    // 4. THREE HEX/CIRCLE RINGS
    const rings = new THREE.Group();
    [9, 13, 17].forEach((r, i) => {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(r, 0.035, 6, i===2?64:i===1?8:6),
            wireMat(0.04 - i*0.007)
        );
        ring.rotation.x = Math.PI/2;
        rings.add(ring);
    });
    rings.position.z = -14;
    scene.add(rings);

    // 5. NETWORK NODE GRAPH (cybersecurity)
    const netGroup = new THREE.Group();
    const nodePos = [
        [0,0,0],[5,3,0],[-5,2,0],[5,-3,-1],[-5,-3,-1],
        [0,5,-2],[8,0,-2],[-8,0,-2],[1,-6,-1],[-2,6,-2]
    ];
    const nodeMeshes = nodePos.map(([x,y,z]) => {
        const m = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.2, 0),
            new THREE.MeshBasicMaterial({ color:green, transparent:true, opacity:0.7 })
        );
        m.position.set(x, y, z);
        netGroup.add(m);
        return m;
    });
    [[0,1],[0,2],[0,3],[0,4],[0,5],[1,6],[2,7],[3,8],[4,9],[1,3],[2,4]].forEach(([a,b]) => {
        const pts = [new THREE.Vector3(...nodePos[a]), new THREE.Vector3(...nodePos[b])];
        netGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat(0.1)));
    });
    netGroup.position.set(-16, -4, -5);
    scene.add(netGroup);

    // 6. SHIELD WIREFRAME
    const shieldGrp = new THREE.Group();
    const shieldArc = new THREE.Mesh(
        new THREE.TorusGeometry(5, 0.05, 6, 40, Math.PI),
        new THREE.MeshBasicMaterial({ color:green, transparent:true, opacity:0.07 })
    );
    shieldArc.rotation.z = Math.PI;
    shieldGrp.add(shieldArc);
    const shieldCone = new THREE.Mesh(
        new THREE.ConeGeometry(5, 4, 40, 1, true),
        wireMat(0.04)
    );
    shieldCone.position.y = -4;
    shieldGrp.add(shieldCone);
    shieldGrp.position.set(18, 5, -10);
    scene.add(shieldGrp);

    // 7. LOCK WIREFRAME
    const lockGrp = new THREE.Group();
    lockGrp.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 0.3), wireMat(0.09)));
    const shackle = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.1, 6, 12, Math.PI),
        new THREE.MeshBasicMaterial({ color:green, transparent:true, opacity:0.09 })
    );
    shackle.position.y = 1.1;
    lockGrp.add(shackle);
    lockGrp.position.set(-20, 9, -7);
    scene.add(lockGrp);

    // 8. DATA STREAM LINES (vertical)
    const streamGrp = new THREE.Group();
    for (let i=0; i<14; i++) {
        const x = (Math.random()-0.5)*44;
        const z = -12 - Math.random()*16;
        const pts = [];
        for (let j=0; j<22; j++) pts.push(new THREE.Vector3(x+(Math.random()-0.5)*0.3, -22+j*2, z));
        streamGrp.add(new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(pts),
            lineMat(0.04 + Math.random()*0.05)
        ));
    }
    scene.add(streamGrp);

    // 9. STAR PARTICLES — dense field
    const pGeo = new THREE.BufferGeometry();
    const pArr = new Float32Array(9000*3);
    for (let i=0; i<9000; i++) {
        pArr[i*3]   = (Math.random()-0.5)*200;
        pArr[i*3+1] = (Math.random()-0.5)*200;
        pArr[i*3+2] = (Math.random()-0.5)*200;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const particles = new THREE.Points(pGeo, pointMat(0.11, 0.32));
    scene.add(particles);

    // 10. BRIGHT ACCENT PARTICLES
    const aGeo = new THREE.BufferGeometry();
    const aArr = new Float32Array(600*3);
    for (let i=0; i<600; i++) {
        aArr[i*3]   = (Math.random()-0.5)*130;
        aArr[i*3+1] = (Math.random()-0.5)*130;
        aArr[i*3+2] = (Math.random()-0.5)*90;
    }
    aGeo.setAttribute('position', new THREE.BufferAttribute(aArr, 3));
    const accents = new THREE.Points(aGeo, pointMat(0.25, 0.65, cyan));
    scene.add(accents);

    // 11. FLOATING SHARDS
    const shards = [];
    for (let i=0; i<24; i++) {
        const geo = i%3===0
            ? new THREE.OctahedronGeometry(0.18+Math.random()*0.45, 0)
            : i%3===1
            ? new THREE.TetrahedronGeometry(0.22+Math.random()*0.42, 0)
            : new THREE.IcosahedronGeometry(0.15+Math.random()*0.32, 0);
        const m = new THREE.Mesh(geo, wireMat(0.08+Math.random()*0.1));
        m.position.set((Math.random()-0.5)*55, (Math.random()-0.5)*48, (Math.random()-0.5)*36-4);
        m.userData = { rs:(Math.random()-0.5)*0.016, fs:0.3+Math.random()*0.6, fo:Math.random()*Math.PI*2 };
        scene.add(m); shards.push(m);
    }

    // 12. MOVING GRID
    const gridGrp = new THREE.Group();
    [{y:-26,op:0.04},{y:26,op:0.03}].forEach(({y,op}) => {
        const g = new THREE.GridHelper(360, 72, green, green);
        g.rotation.x = Math.PI/2; g.position.y = y;
        g.material.transparent = true; g.material.opacity = op;
        gridGrp.add(g);
    });
    scene.add(gridGrp);

    // ── ANIMATE ──
    const clock = new THREE.Clock();
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        tk.rotation.x  = Math.sin(t/5)*0.5;
        tk.rotation.y  = t*0.07;
        tk.rotation.z  = t*0.035;
        tk2.rotation.x = t*0.055;
        tk2.rotation.y = -t*0.085;
        ico.rotation.x = t*0.045;
        ico.rotation.y = t*0.06;

        rings.rotation.z = t*0.04;
        rings.rotation.x = Math.sin(t*0.1)*0.07;

        netGroup.rotation.y = t*0.07;
        nodeMeshes.forEach((n,i) => n.scale.setScalar(0.8+Math.sin(t*1.1+i*0.9)*0.28));

        shieldGrp.position.y = 5 + Math.sin(t*0.45)*1.8;
        shieldGrp.rotation.y = Math.sin(t*0.25)*0.35;

        lockGrp.position.y = 9 + Math.cos(t*0.38)*1.4;
        lockGrp.rotation.y = t*0.18;

        streamGrp.children.forEach((l,i) => { l.position.y = ((t*(1.4+i*0.08))%48)-24; });

        gridGrp.position.z = (t*3) % 50;
        particles.rotation.y = t*0.018;
        accents.rotation.y   = -t*0.013;
        accents.rotation.z   = t*0.007;

        shards.forEach(s => {
            s.rotation.x += s.userData.rs;
            s.rotation.y += s.userData.rs*0.7;
            s.position.y += Math.sin(t*s.userData.fs+s.userData.fo)*0.004;
        });

        camera.position.x = Math.sin(t*0.055)*2.2;
        camera.position.y = Math.cos(t*0.038)*1.4;
        camera.lookAt(0, 0, 0);

        pl1.intensity = 3.5+Math.sin(t*1.1)*1.2;
        pl2.intensity = 2.0+Math.cos(t*0.8)*0.8;

        renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();


// ============================================================
// MOBILE MENU
// ============================================================
const menuBtn    = document.querySelector('#mobile-menu-btn');
const mobileMenu = document.querySelector('#mobile-menu');
menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    menuBtn.querySelector('i').setAttribute('data-lucide', mobileMenu.classList.contains('hidden') ? 'menu' : 'x');
    lucide.createIcons();
});
mobileMenu.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
    menuBtn.querySelector('i').setAttribute('data-lucide', 'menu');
    lucide.createIcons();
}));