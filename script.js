// ============================================
        // Contact Drop-up Menu
        // ============================================
        const contactBtn = document.getElementById('contactBtn');
        const contactDropup = document.getElementById('contactDropup');

        // Position drop-up centered under contact button
        function positionDropup() {
            const btnRect = contactBtn.getBoundingClientRect();
            const btnCenterX = btnRect.left + (btnRect.width / 2);
            contactDropup.style.left = btnCenterX + 'px';
        }

        // Toggle drop-up menu
        contactBtn.addEventListener('click', (e) => {
            e.preventDefault();
            positionDropup();
            contactDropup.classList.toggle('active');
        });

        // Reposition on window resize
        window.addEventListener('resize', () => {
            if (contactDropup.classList.contains('active')) {
                positionDropup();
            }
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!contactBtn.contains(e.target) && !contactDropup.contains(e.target)) {
                contactDropup.classList.remove('active');
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                contactDropup.classList.remove('active');
            }
        });

        // ============================================
        // Mouse tracking for heading proximity
        // ============================================
        document.addEventListener('mousemove', (e) => {
            updateHeadingProximity(e.clientX, e.clientY);
        });

        // ============================================
        // Heading Proximity Effect
        // ============================================
        const headingContainer = document.getElementById('headingContainer');
        const headingOverlay = document.getElementById('headingOverlay');
        let lastMouseX = 0;
        let lastMouseY = 0;
        let lastMoveTime = Date.now();
        let fadeTimeout;
        let currentOpacity = 0;
        let currentRadius = 0;

        function updateHeadingProximity(mouseX, mouseY) {
            if (!headingContainer || !headingOverlay) return;

            const rect = headingContainer.getBoundingClientRect();
            const x = mouseX - rect.left;
            const y = mouseY - rect.top;

            const isNearHeading = mouseX >= rect.left - 100 &&
                                  mouseX <= rect.right + 100 &&
                                  mouseY >= rect.top - 100 &&
                                  mouseY <= rect.bottom + 100;

            if (isNearHeading) {
                const maxRadius = 55;
                const minRadius = 15;

                const now = Date.now();
                const timeDelta = Math.max(now - lastMoveTime, 1);
                const deltaX = mouseX - lastMouseX;
                const deltaY = mouseY - lastMouseY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const velocity = distance / timeDelta * 16;

                const minVelocity = 0.3;
                const maxVelocity = 15;
                const minOpacity = 0.75;
                const maxOpacity = 1.0;

                let velocityFactor = Math.min(Math.max((velocity - minVelocity) / (maxVelocity - minVelocity), 0), 1);
                let targetOpacity = minOpacity + (maxOpacity - minOpacity) * velocityFactor;
                let targetRadius = minRadius + (maxRadius - minRadius) * velocityFactor;

                currentOpacity = currentOpacity * 0.7 + targetOpacity * 0.3;
                currentRadius = currentRadius * 0.7 + targetRadius * 0.3;

                headingOverlay.style.transition = 'none';
                headingOverlay.style.opacity = currentOpacity;
                headingOverlay.style.clipPath = `circle(${currentRadius}px at ${x}px ${y}px)`;

                lastMouseX = mouseX;
                lastMouseY = mouseY;
                lastMoveTime = now;

                clearTimeout(fadeTimeout);
                fadeTimeout = setTimeout(() => {
                    headingOverlay.style.transition = 'opacity 0.8s ease-out, clip-path 0.8s ease-out';
                    headingOverlay.style.opacity = '0';
                    headingOverlay.style.clipPath = `circle(0px at ${x}px ${y}px)`;
                    currentOpacity = 0;
                    currentRadius = 0;
                }, 50);
            } else {
                headingOverlay.style.transition = 'opacity 0.8s ease-out, clip-path 0.8s ease-out';
                headingOverlay.style.opacity = '0';
                const lastX = lastMouseX - rect.left;
                const lastY = lastMouseY - rect.top;
                headingOverlay.style.clipPath = `circle(0px at ${lastX}px ${lastY}px)`;
                currentOpacity = 0;
                currentRadius = 0;
            }
        }

        // ============================================
        // Full Page Snap Scrolling with Horizontal Projects
        // ============================================
        const pagesContainer = document.getElementById('pagesContainer');
        const projectsTrack = document.getElementById('projectsTrack');
        const titlesTrack = document.getElementById('titlesTrack');
        const ColorOverlay = document.getElementById('ColorOverlay');
        const sectionIndicator = document.getElementById('sectionIndicator');
        const indicatorItems = document.querySelectorAll('.indicator-item');

        const totalVerticalPages = 4; // Hero, Projects, Experience, Footer
        const totalProjects = 3;

        let currentVerticalPage = 0;
        let currentProject = 0;
        let isAnimating = false;
        let isCardExpanded = false;

        // Rotation state
        let currentRotation = 0;
        let targetRotation = 0;
        const ROTATION_PER_SNAP = 180; // Half rotation (parallelogram symmetry)
        const ANIMATION_DURATION = 1500; // Shape rotates for 1.5s

        // Parallelogram shape
        const SHAPE_SIZE = 0.8;
        const baseShape = [
            { x: -0.30, y: -0.25 },
            { x: 0.45, y: -0.25 },
            { x: 0.30, y: 0.25 },
            { x: -0.45, y: 0.25 }
        ];

        function rotatePoint(x, y, angle) {
            const rad = angle * Math.PI / 180;
            return {
                x: x * Math.cos(rad) - y * Math.sin(rad),
                y: x * Math.sin(rad) + y * Math.cos(rad)
            };
        }

        function updateOverlayClipPath(rotation) {
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const centerX = vw / 2;
            const centerY = vh / 2;
            const size = Math.min(vw, vh) * SHAPE_SIZE;

            const transformedPoints = baseShape.map(p => {
                const rotated = rotatePoint(p.x, p.y, rotation);
                return {
                    x: centerX + rotated.x * size,
                    y: centerY + rotated.y * size
                };
            });

            const p = transformedPoints;

            const clipPath = `polygon(
                evenodd,
                0% 0%,
                100% 0%,
                100% 100%,
                0% 100%,
                0% 0%,
                ${p[0].x}px ${p[0].y}px,
                ${p[3].x}px ${p[3].y}px,
                ${p[2].x}px ${p[2].y}px,
                ${p[1].x}px ${p[1].y}px,
                ${p[0].x}px ${p[0].y}px
            )`;

            ColorOverlay.style.clipPath = clipPath;
        }

        // Custom easing function: very slow start, fast middle, very slow end
        // This creates a velocity curve that peaks at 50% progress (180°)
        function velocityCurveEasing(t) {
            // Ease-in-out with stronger acceleration
            // This makes beginning and end much slower
            if (t < 0.5) {
                // First half: ease in (slow to fast)
                return 4 * t * t * t;
            } else {
                // Second half: ease out (fast to slow)
                return 1 - Math.pow(-2 * t + 2, 3) / 2;
            }
        }

        // Animate rotation with smooth continuous motion and velocity curve
        let rotationAnimationId = null;

        function animateRotation(startRotation, endRotation) {
            if (rotationAnimationId) {
                cancelAnimationFrame(rotationAnimationId);
            }

            const startTime = Date.now();
            const totalRotation = endRotation - startRotation;

            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / ANIMATION_DURATION, 1);

                // Apply velocity curve easing - peaks at 50% (180°)
                const eased = velocityCurveEasing(progress);

                const rotation = startRotation + totalRotation * eased;
                currentRotation = rotation;
                updateOverlayClipPath(rotation);

                if (progress < 1) {
                    rotationAnimationId = requestAnimationFrame(animate);
                } else {
                    currentRotation = endRotation;
                    rotationAnimationId = null;
                }
            }

            animate();
        }

        function updateProjectPosition(index) {
            projectsTrack.style.transform = `translateX(-${index * 100}vw)`;
            titlesTrack.style.transform = `translateX(-${index * 100}vw)`;
        }

        function updateIndicators(projectIndex) {
            indicatorItems.forEach((item, i) => {
                item.classList.toggle('active', i === projectIndex);
            });
        }

        function goToVerticalPage(pageIndex) {
            if (pageIndex < 0 || pageIndex >= totalVerticalPages) return;
            if (pageIndex === currentVerticalPage) return;

            pagesContainer.style.transform = `translateY(-${pageIndex * 100}vh)`;
            currentVerticalPage = pageIndex;

            // Show/hide indicator
            if (pageIndex === 1) {
                sectionIndicator.classList.add('visible');
            } else {
                sectionIndicator.classList.remove('visible');
            }
        }

        function goToProject(projectIndex, direction) {
            if (projectIndex < 0 || projectIndex >= totalProjects) return;
            if (projectIndex === currentProject) return;

            // Update horizontal position
            updateProjectPosition(projectIndex);
            updateIndicators(projectIndex);

            // Animate rotation with smooth velocity curve
            targetRotation += ROTATION_PER_SNAP * direction;
            animateRotation(currentRotation, targetRotation);

            currentProject = projectIndex;
             if (projectIndex === 0) {
                setTimeout(() => showConstructionBanner(), 100);
            }
        }

        function handleNavigation(direction) {
            if (isAnimating || isCardExpanded) return;
            isAnimating = true;

            // Currently on hero page
            if (currentVerticalPage === 0) {
                if (direction > 0) {
                    // Go to projects
                    goToVerticalPage(1);
                    sectionIndicator.classList.add('visible');

                    // Show construction banner when entering project page
                    showConstructionBanner();
                }
                // Can't go up from hero
            }
            // Currently on projects page
            else if (currentVerticalPage === 1) {
                if (direction > 0) {
                    // Try to go to next project
                    if (currentProject < totalProjects - 1) {
                        goToProject(currentProject + 1, direction);
                    } else {
                        // Last project, go to experience cards
                        goToVerticalPage(2);
                    }
                } else {
                    // Try to go to previous project
                    if (currentProject > 0) {
                        goToProject(currentProject - 1, direction);
                        if (currentProject - 1 === 0) {
                            setTimeout(() => showConstructionBanner(), 100);
                        }
                    } else {
                        // First project, go to hero
                        goToVerticalPage(0);
                    }
                }
            }
            // Currently on experience cards page
            else if (currentVerticalPage === 2) {
                if (direction > 0) {
                    // Go to footer
                    goToVerticalPage(3);
                } else if (direction < 0) {
                    // Go back to projects (at last project)
                    goToVerticalPage(1);
                    currentProject = totalProjects - 1;
                    updateProjectPosition(currentProject);
                    updateIndicators(currentProject);
                    if (currentProject === 0) {
                        setTimeout(() => showConstructionBanner(), 100);
                    }
                }
            }
            // Currently on footer page
            else if (currentVerticalPage === 3) {
                if (direction < 0) {
                    // Go back to experience cards
                    goToVerticalPage(2);
                }
                // Can't go down from footer
            }

            setTimeout(() => {
                isAnimating = false;
            }, ANIMATION_DURATION);
        }

        // Scroll/wheel handler
        let scrollAccumulator = 0;
        const SCROLL_THRESHOLD = 30;

        function handleWheel(e) {
            // FIXED: Allow scrolling in expanded card content
            if (isCardExpanded) {
                const expandedContent = document.querySelector('.expanded-content');
                if (expandedContent && expandedContent.contains(e.target)) {
                    // Allow natural scrolling in the expanded card
                    return;
                }
            }

            e.preventDefault();

            if (isAnimating) return;

            scrollAccumulator += e.deltaY;

            if (Math.abs(scrollAccumulator) >= SCROLL_THRESHOLD) {
                const direction = scrollAccumulator > 0 ? 1 : -1;
                handleNavigation(direction);
                scrollAccumulator = 0;
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: false });

        // Touch support
        let touchStartY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const deltaY = touchStartY - touchEndY;

            if (Math.abs(deltaY) > 50 && !isAnimating) {
                const direction = deltaY > 0 ? 1 : -1;
                handleNavigation(direction);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (isAnimating) return;

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                handleNavigation(1);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                handleNavigation(-1);
            }
        });

        // Indicator click handlers
        indicatorItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                if (isAnimating || currentVerticalPage !== 1) return;

                const direction = index > currentProject ? 1 : -1;
                if (index !== currentProject) {
                    isAnimating = true;
                    goToProject(index, direction);
                    setTimeout(() => {
                        isAnimating = false;
                    }, ANIMATION_DURATION);
                }
            });
             });

        // Initialize
        updateOverlayClipPath(0);

        // ============================================
        // Construction Banner Logic
        // ============================================
        const constructionBanner = document.getElementById('constructionBanner');
        const constructionContent = document.getElementById('constructionContent');

        function showConstructionBanner() {
            if (currentProject !== 0) return;

            // Wait a bit for page transition, then show banner
            setTimeout(() => {
                if (currentVerticalPage === 1 && currentProject === 0) {
                    constructionBanner.classList.add('visible');
                }
            }, 800);
        }

        function hideConstructionBanner() {
            constructionBanner.classList.remove('visible');
        }

        // Click anywhere on construction banner to dismiss
        constructionContent.addEventListener('click', (e) => {
            hideConstructionBanner();
        });

        // Also dismiss on escape key when banner is visible
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && constructionBanner.classList.contains('visible')) {
                hideConstructionBanner();
            }
        });

        // ============================================
        // Expanding Tech Stack Assembly Chain Animation
        // Sequence per icon: existing icons slide right to open gap new icon pops into gap
        // ============================================
        const techIcons = Array.from(document.querySelectorAll('.tech-icon'));
        const techStack = document.getElementById('techStack');
        let techStackAnimated = false;

        const ICON_SIZE = 42;
        const ICON_GAP = 16;
        const ICON_STEP = ICON_SIZE + ICON_GAP;

        function animateTechStack() {
            if (techStackAnimated) return;
            techStackAnimated = true;

            const totalIcons = techIcons.length;
            const totalWidth = (totalIcons * ICON_SIZE) + ((totalIcons - 1) * ICON_GAP);
            techStack.style.width = totalWidth + 'px';

            // All icons start hidden at left:0
            techIcons.forEach(icon => {
                icon.style.left = '0px';
                icon.style.opacity = '0';
                icon.style.transform = 'scale(0)';
            });

            // Timing – much faster
            const SLIDE_TIME = 30;   // Existing icons slide to make room
            const POP_TIME = 120;     // New icon pops in
            const PAUSE_TIME = 50;    // Tiny breath between steps
            const STEP_TIME = SLIDE_TIME + POP_TIME + PAUSE_TIME;

            techIcons.forEach((icon, i) => {
                const stepStart = 300 + (i * STEP_TIME);

                // Step 1: Slide all PREVIOUS icons right to make room at position 0
                // Icon j (j < i) moves from slot (i-1-j) to slot (i-j)
                if (i > 0) {
                    setTimeout(() => {
                        for (let j = 0; j < i; j++) {
                            const slot = i - j;
                            techIcons[j].style.left = (slot * ICON_STEP) + 'px';
                        }
                    }, stepStart);
                }

                // Step 2: After gap opens, pop in the new icon at position 0
                setTimeout(() => {
                    icon.style.left = '0px';
                    icon.classList.add('pop-in');
                }, stepStart + (i > 0 ? SLIDE_TIME : 0));
            });

            // Clean up after all done set inline styles so icons stay visible
            const finishTime = 300 + (totalIcons * STEP_TIME) + 100;
            setTimeout(() => {
                techIcons.forEach(icon => {
                    icon.classList.remove('pop-in');
                    icon.style.opacity = '1';
                    icon.style.transform = 'scale(1)';
                    icon.classList.add('visible');
                });
            }, finishTime);
        }

        // Run on page load
        animateTechStack();

        // Re-trigger when navigating back to hero
        const originalGoToVerticalPage = goToVerticalPage;
        goToVerticalPage = function(pageIndex) {
            originalGoToVerticalPage(pageIndex);
            if (pageIndex === 0 && !techStackAnimated) {
                animateTechStack();
            }
        };

        // ============================================
        // Nav Button Handlers
        // ============================================
        function navJumpTo(page) {
            if (isAnimating) return;
            isAnimating = true;

            // If jumping to projects page, reset to first project
            if (page === 1) {
                currentProject = 0;
                updateProjectPosition(0);
                updateIndicators(0);

                // Show construction banner when jumping to first project
                setTimeout(() => {
                    showConstructionBanner();
                }, 800);
            }

            goToVerticalPage(page);
            setTimeout(() => {
                isAnimating = false;
            }, ANIMATION_DURATION);
        }

        // About Hero (page 0)
        const aboutBtn = document.getElementById('aboutBtn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navJumpTo(0);
            });
        }

        // Logo Hero (page 0)
        const logoBtn = document.getElementById('logoBtn');
        if (logoBtn) {
            logoBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navJumpTo(0);
            });
        }

        // Work Projects (page 1)
        const workBtn = document.getElementById('workBtn');
        if (workBtn) {
            workBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navJumpTo(1);
            });
        }

        // Resume Experience (page 2)
        const resumeBtn = document.getElementById('resumeBtn');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navJumpTo(2);
            });
        }

        // ============================================
        // ============================================
        // Experience Carousel + Category Switching
        // ============================================

        // UPDATED: Complete data with unique responsibilities and technologies for each experience
        const industryData = [
            {
                image: 'images/company_logos/bmw_motorsport.png',
                date: '10.2025 - Present',
                title: 'Data/Performance Engineer Intern',
                company: 'BMW M Motorsport',
                description: 'Built a data analysis pipeline that transforms more than 1 million datapoints of competitor race data into derived performance and strategy indicators, used directly by chief engineers during race and preparation sessions.',
                responsibilities: [
                    'Developed automated competitor analysis pipeline processing 1M+ data points per session',
                    'Redevelopment of an energy management tool, with physical modeling and sweeping for in-car deployment',
                    'Collaborated with race engineers to define KPIs and visualization requirements'
                ],
                technologies: ['Python', 'Pandas', 'NumPy', 'Seaborn']
            },
            {
                image: 'images/company_logos/bmw.png',
                date: '05.2025 - 10.2025',
                title: 'Software Engineer Intern',
                company: 'BMW Group',
                description: 'Implemented a Python-based data pipeline for high-frequency measurement data, covering optimized data loading, filtering, processing and augmentation for downstream analysis and modeling.',
                responsibilities: [
                    'Built a GUI-based modeling tool for physical data, replacing a manual workflow and reducing per-data-point processing time from 15 minutes to 1 minute, saving more than 90%',
                    'Part of special task force for time-sensitive challenges',
                    'Close collaboration with test- and simulation engineers as well as the head of the department',
                ],
                technologies: ['Python', 'Pandas','NumPy', 'Git', 'Seaborn']
            },
            {
                image: 'images/company_logos/wzl.png',
                date: '02.2025 - 05.2025',
                title: 'Data Scientist Working Student',
                company: 'WZL Laboratory Aachen',
                description: 'Analyzed machine and production data regarding hidden AI potentials in additive manufacturing environments.',
                responsibilities: [
                    'Conducted exploratory data analysis on manufacturing process data',
                    'Presented findings to partners and cross-functional teams'
                ],
                technologies: ['Python', 'Seaborn']
            },
            {
                image: 'images/company_logos/porsche.png',
                date: '04.2024 - 10.2024',
                title: 'MLOps Engineer Intern',
                company: 'Porsche AG',
                description: 'Developed MLOps pipelines in MS Azure and Python (PyTorch), including tabular datasets & model versioning, distributed multi-GPU training and automated metric tracking.',
                responsibilities: [
                    'Architected end-to-end MLOps pipeline on Azure ML platform',
                    'Implemented custom transformer architectures regarding Tokenization, Layering and Input in PyTorch',
                    'Created custom data representations for combined material and geometry data',
                ],
                technologies: ['Python', 'PyTorch', 'MS Azure', 'Seaborn', 'Git']
            },
            {
                image: 'images/company_logos/ika.png',
                date: '04.2024 - 10.2024',
                title: 'Bachelor Thesis - Grade A+',
                company: 'IKA - RWTH',
                description: 'TITLE: Data Format Research for machine learning based HIC predictions in structural vehicle Analysis.',
                responsibilities: [
                    'Academic writing of my experiment results',
                    'Presentation of experiment results',
                ],
                technologies: ['Python', 'PyTorch', 'MS Azure', 'Seaborn', 'Git']
            },
            {
                image: 'images/company_logos/bosch.png',
                date: '10.2023 - 03.2024',
                title: 'ML Engineer',
                company: 'Bosch Engineering GmbH',
                description: 'Developed autoencoder models from the ground up for time series applications, implementing unique latent space designs and baseline architectures using Python and PyTorch.',
                responsibilities: [
                    'Conducted vehicle simulations with IPGCarmaker',
                    'Conducted experiments regarding the models functionality as a foundational model and transferability across datasets.',
                    'Data analysis for time series data',
                ],
                technologies: ['Python', 'PyTorch', 'SciKit', 'Git', 'Pandas']
            },
            {
                image: 'images/company_logos/wzl.png',
                date: '04.2023 - 09.2023',
                title: 'Computer Vision Engineer Intern',
                company: 'Smart Automation Lab - A WZL Project',
                description: 'Developed a custom object detection model and dataset improving the accuracy by 25%, by utilizing a different model architecture, better data augmentation techniques and a bigger dataset.',
                responsibilities: [
                    'Live video stream inference with ONNX runtime',
                    'Implemented YOLO-based object detection model with custom modifications in robot behavior tree system',
                    'Curated and annotated custom dataset',
                    'Achieved 25% accuracy improvement over existing solution'
                ],
                technologies: ['Python', 'PyTorch', 'OpenCV', 'Git', 'ONNX', 'ROS']
            }
        ];

        const academicData = [
            {
                image: 'images/company_logos/bmw.png',
                date: '10.2025 - present',
                title: 'Fastlane Scholarship',
                company: 'BMW Group',
                description: "One of a handful of students who has been selected for BMW's masters scholarship.",
                responsibilities: [
                    'Selected from 2000+ applicants for prestigious scholarship program',
                    'Monthly stipend for M.Sc. studies',
                    'Exclusive mentorship from BMW senior leaders',
                ],
                technologies: ['Leadership', 'Research', 'Innovation']
            },
            {
                image: 'images/company_logos/rwth.png',
                date: '10.2025 - present',
                title: 'M.Sc. Engineering - Simulation Sciences',
                company: 'RWTH Aachen University',
                description: 'Specialization in Simulation Science with general degree in mechanical engineering and courses in:',
                responsibilities: [
                    'Machine Learning',
                    'Finite Element Analysis (FEA)',
                    'Automotive Engineering',
                    'Business'
                ],
                technologies: ['Python', 'PyTorch', 'MATLAB', 'ANSYS']
            },
            {
                image: 'images/company_logos/rwth.png',
                date: '10.2019 - 03.2025',
                title: 'B.Sc. Engineering - Automotive',
                company: 'RWTH Aachen University',
                description: 'Specialization in Automotive Engineering with general degree in mechanical engineering and courses in:',
                responsibilities: [
                    'Math (Calculus, Linear Algebra, Differential Equations, Numerical, Statistics)',
                    'Mechanics (Static, Dynamic, Fluid)',
                    'Electronics, Control Theory and Simulation',
                    'Subjects from automotive specialization',
                    'Programming with Python, Java and Matlab',
                ],
                technologies: ['CAD', 'Python', 'MATLAB', 'Simulink']
            }
        ];

        // Fan layout configs for academic (3 cards)
        const fanLayout = [
            { x: -200, r: -8, z: 1 },
            { x: 0, r: 0, z: 2 },
            { x: 200, r: 8, z: 1 }
        ];

        // Fan hover shifts - cards move along their fan radius vectors
        const fanHoverShifts = {
            0: [ // When left card is hovered
                { x: -280, r: -8 },   // Left card moves further left/down along its vector
                { x: 60, r: 0 },      // Center moves right
                { x: 280, r: 8 }      // Right moves further right/down
            ],
            1: [ // When center card is hovered
                { x: -280, r: -8 },   // Left moves further out
                { x: 0, r: 0 },       // Center stays (but lifts)
                { x: 280, r: 8 }      // Right moves further out
            ],
            2: [ // When right card is hovered
                { x: -280, r: -8 },   // Left moves further left/down
                { x: -60, r: 0 },     // Center moves left
                { x: 280, r: 8 }      // Right card moves further right/down
            ]
        };

        // State
        let currentCategory = 'industry';
        let carouselCurrentIndex = 0;
        let lastIndustryIndex = 0;
        let isCarouselDragging = false;
        let carouselStartX = 0;
        let carouselCurrentX = 0;
        let carouselDragOffset = 0;
        let isCategorySwitching = false;
        const CAROUSEL_DRAG_THRESHOLD = 80;

        // DOM elements
        const carouselWrapper = document.getElementById('carouselWrapper');
        const cardsContainer = document.getElementById('cardsContainer');
        const carouselIndicatorsContainer = document.getElementById('carouselIndicators');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const categorySlider = document.getElementById('categorySlider');

        let experienceCards = [];
        let currentData = industryData;

        // Initialize cards
        function initializeExperienceCards(data, category) {
            // Clear existing
            cardsContainer.innerHTML = '';
            carouselIndicatorsContainer.innerHTML = '';

            currentData = data;

            // Create cards
            experienceCards = data.map((item, index) => {
                const card = document.createElement('div');
                card.className = 'experience-card';
                card.dataset.index = index;
                card.dataset.category = category;
                card.innerHTML = `
                    <img src="${item.image}" alt="${item.company}" class="card-image">
                    <div class="card-content">
                        <div class="card-date">${item.date}</div>
                        <div class="card-title">${item.title}</div>
                        <div class="card-company">${item.company}</div>
                        <div class="card-description">${item.description}</div>
                    </div>
                `;
                cardsContainer.appendChild(card);

                // Hover effect
                card.addEventListener('mouseenter', () => {
                    if (!isCategorySwitching) {
                        if (currentCategory === 'academic') {
                            // Fan mode: shift cards along their radii, elevate hovered card
                            const hoveredIndex = parseInt(card.dataset.index);
                            const shifts = fanHoverShifts[hoveredIndex];

                            experienceCards.forEach((c, i) => {
                                const shift = shifts[i];
                                const baseTransform = `translateX(${shift.x}px) rotate(${shift.r}deg) scale(1)`;

                                if (i === hoveredIndex) {
                                    // Hovered card: higher z-index and lift
                                    c.style.zIndex = 100;
                                    c.style.transform = baseTransform + ' translateY(-15px)';
                                } else {
                                    // Other cards: maintain original z-index
                                    const pos = fanLayout[i];
                                    c.style.zIndex = pos.z;
                                    c.style.transform = baseTransform;
                                }
                            });
                        } else {
                            // Carousel mode: just lift
                            const baseTransform = card.dataset.baseTransform || card.style.transform;
                            card.style.transform = baseTransform + ' translateY(-15px)';
                        }
                    }
                });

                card.addEventListener('mouseleave', () => {
                    if (!isCategorySwitching) {
                        if (currentCategory === 'academic') {
                            // Fan mode: return all cards to base positions
                            experienceCards.forEach((c, i) => {
                                const pos = fanLayout[i];
                                const baseTransform = `translateX(${pos.x}px) rotate(${pos.r}deg) scale(1)`;
                                c.style.transform = baseTransform;
                                c.dataset.baseTransform = baseTransform;
                                c.style.zIndex = pos.z;
                            });
                        } else {
                            // Carousel mode: return to base
                            const baseTransform = card.dataset.baseTransform || '';
                            if (baseTransform) {
                                card.style.transform = baseTransform;
                            }
                        }
                    }
                });

                // Click handler - center in carousel or expand
                card.addEventListener('click', (e) => {
                    if (isCategorySwitching || isCardExpanded) return;

                    if (currentCategory === 'industry') {
                        if (Math.abs(carouselDragOffset) < 5) {
                            // If it's the center card, expand it
                            if (index === carouselCurrentIndex) {
                                openCard(card, item); // Pass item data
                            } else {
                                // Otherwise, center it
                                goToCarouselCard(index);
                            }
                        }
                    } else if (currentCategory === 'academic') {
                        // Academic cards open directly
                        openCard(card, item); // Pass item data
                    }
                });

                return card;
            });

            // Create indicators for carousel mode
            if (category === 'industry') {
                data.forEach((_, index) => {
                    const dot = document.createElement('div');
                    dot.className = 'carousel-indicator-dot';
                    dot.dataset.index = index;
                    dot.addEventListener('click', () => goToCarouselCard(index));
                    carouselIndicatorsContainer.appendChild(dot);
                });
                carouselIndicatorsContainer.classList.remove('hidden');
            } else {
                carouselIndicatorsContainer.classList.add('hidden');
            }
        }

        // Update carousel positions (industry mode)
        function updateCarouselPositions(smooth = true) {
            if (currentCategory !== 'industry') return;

            const totalCards = experienceCards.length;

            // Update indicator
            document.querySelectorAll('.carousel-indicator-dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === carouselCurrentIndex);
            });

            experienceCards.forEach((card, index) => {
                let offset = index - carouselCurrentIndex;

                // Handle wrapping
                if (offset > totalCards / 2) offset -= totalCards;
                if (offset < -totalCards / 2) offset += totalCards;

                // Transitions
                if (smooth && !isCarouselDragging) {
                    card.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease, filter 0.6s ease, outline 0.3s ease';
                } else {
                    card.style.transition = 'transform 0.1s ease-out, opacity 0.1s ease-out, filter 0.1s ease-out, outline 0.3s ease';
                }

                const spacing = 380;
                const baseX = offset * spacing;
                const adjustedX = baseX + carouselDragOffset;

                let baseTransform = '';

                if (offset === 0) {
                    card.className = 'experience-card center';
                    baseTransform = `translateX(${adjustedX}px) scale(1.1) translateY(-20px)`;
                } else if (Math.abs(offset) === 1) {
                    card.className = 'experience-card side';
                    const scale = 0.85;
                    const yOffset = 30;
                    baseTransform = `translateX(${adjustedX}px) scale(${scale}) translateY(${yOffset}px)`;
                } else if (Math.abs(offset) === 2) {
                    card.className = 'experience-card far';
                    const scale = 0.7;
                    const yOffset = 50;
                    baseTransform = `translateX(${adjustedX}px) scale(${scale}) translateY(${yOffset}px)`;
                } else {
                    card.className = 'experience-card hidden';
                    const scale = 0.5;
                    baseTransform = `translateX(${adjustedX}px) scale(${scale}) translateY(70px)`;
                }

                card.style.transform = baseTransform;
                card.dataset.baseTransform = baseTransform;
            });
        }

        // Apply fan layout (academic mode)
        function applyFanLayout() {
            experienceCards.forEach((card, i) => {
                const pos = fanLayout[i];
                card.className = 'experience-card fan';
                const baseTransform = `translateX(${pos.x}px) rotate(${pos.r}deg) scale(1)`;
                card.style.transform = baseTransform;
                card.dataset.baseTransform = baseTransform;
                card.style.zIndex = pos.z;
                card.style.opacity = '1';
                card.style.filter = 'brightness(1)';
            });
        }

        // Navigate to specific card
        function goToCarouselCard(index, smooth = true) {
            if (currentCategory !== 'industry') return;
            carouselCurrentIndex = ((index % experienceCards.length) + experienceCards.length) % experienceCards.length;
            lastIndustryIndex = carouselCurrentIndex;
            carouselDragOffset = 0;
            updateCarouselPositions(smooth);
        }

        // Switch between categories with animations
        function switchExperienceCategory(newCategory) {
            if (newCategory === currentCategory || isCategorySwitching) return;
            isCategorySwitching = true;

            const isToAcademic = newCategory === 'academic';

            if (isToAcademic) {
                // INDUSTRY → ACADEMIC: Unravel carousel off screen
                lastIndustryIndex = carouselCurrentIndex;
                carouselWrapper.classList.add('fan-mode');

                experienceCards.forEach((card, i) => {
                    const delay = i * 0.06;
                    card.classList.add('unraveling');
                    card.style.transitionDelay = delay + 's';

                    // Each card flies off to the right, progressively further
                    const flyX = 1500 + (i * 300);
                    const flyR = 45 + (i * 15);
                    card.style.transform = `translateX(${flyX}px) translateY(-100px) rotate(${flyR}deg) scale(0.5)`;
                });

                // After unravel, switch to academic
                setTimeout(() => {
                    currentCategory = newCategory;
                    initializeExperienceCards(academicData, 'academic');

                    // Position academic cards off-screen left
                    experienceCards.forEach((card, i) => {
                        card.style.transition = 'none';
                        card.style.opacity = '0';
                        card.style.transform = `translateX(-1500px) translateY(100px) rotate(-30deg) scale(0.5)`;
                    });

                    void cardsContainer.offsetHeight;

                    // Fly in to fan positions
                    experienceCards.forEach((card, i) => {
                        const delay = i * 0.08;
                        card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                        card.style.transitionDelay = delay + 's';
                        card.style.opacity = '1';

                        const pos = fanLayout[i];
                        const baseTransform = `translateX(${pos.x}px) rotate(${pos.r}deg) scale(1)`;
                        card.style.transform = baseTransform;
                        card.dataset.baseTransform = baseTransform;
                        card.style.zIndex = pos.z;
                    });

                    setTimeout(() => {
                        experienceCards.forEach(card => {
                            card.classList.remove('unraveling');
                            card.style.transitionDelay = '0s';
                        });
                        isCategorySwitching = false;
                    }, 800);

                }, 600);

            } else {
                // ACADEMIC → INDUSTRY: Fly off, then build carousel
                experienceCards.forEach((card, i) => {
                    const delay = i * 0.06;
                    card.classList.add('unraveling');
                    card.style.transitionDelay = delay + 's';

                    // Fly off to the left
                    const flyX = -1500 - (i * 200);
                    card.style.transform = `translateX(${flyX}px) translateY(-150px) rotate(-40deg) scale(0.5)`;
                });

                setTimeout(() => {
                    currentCategory = newCategory;
                    carouselCurrentIndex = lastIndustryIndex;
                    initializeExperienceCards(industryData, 'industry');
                    carouselWrapper.classList.remove('fan-mode');

                    // Calculate which cards are furthest from center for the final position
                    const totalCards = experienceCards.length;
                    const cardDistances = experienceCards.map((card, i) => {
                        let offset = i - carouselCurrentIndex;
                        if (offset > totalCards / 2) offset -= totalCards;
                        if (offset < -totalCards / 2) offset += totalCards;
                        return { index: i, distance: Math.abs(offset), offset: offset };
                    });

                    // Sort by distance (furthest first) so they build inward
                    cardDistances.sort((a, b) => b.distance - a.distance);

                    // Position all cards off-screen right initially (NO transitions)
                    experienceCards.forEach((card) => {
                        card.style.transition = 'none';
                        card.style.opacity = '0';
                        card.style.transform = `translateX(2000px) translateY(100px) rotate(30deg) scale(0.6)`;
                    });

                    // Force reflow
                    void cardsContainer.offsetHeight;

                    // Enable transitions after a tiny delay
                    requestAnimationFrame(() => {
                        // Fly in one by one, furthest cards first
                        cardDistances.forEach((item, animIndex) => {
                            const i = item.index;
                            const card = experienceCards[i];
                            const offset = item.offset;
                            const delay = animIndex * 80; // 80ms between each card

                            setTimeout(() => {
                                // Enable smooth transition
                                card.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                                card.style.opacity = '1';

                                // Calculate final position in carousel
                                const spacing = 380;
                                const baseX = offset * spacing;

                                let baseTransform = '';
                                let className = 'experience-card';

                                if (offset === 0) {
                                    className += ' center';
                                    baseTransform = `translateX(${baseX}px) scale(1.1) translateY(-20px)`;
                                } else if (Math.abs(offset) === 1) {
                                    className += ' side';
                                    baseTransform = `translateX(${baseX}px) scale(0.85) translateY(30px)`;
                                } else if (Math.abs(offset) === 2) {
                                    className += ' far';
                                    baseTransform = `translateX(${baseX}px) scale(0.7) translateY(50px)`;
                                } else {
                                    className += ' hidden';
                                    baseTransform = `translateX(${baseX}px) scale(0.5) translateY(70px)`;
                                }

                                card.className = className;
                                card.style.transform = baseTransform;
                                card.dataset.baseTransform = baseTransform;
                            }, delay);
                        });

                        // Clean up after all animations complete
                        const totalAnimTime = cardDistances.length * 80 + 600;
                        setTimeout(() => {
                            updateCarouselPositions(false);
                            isCategorySwitching = false;
                        }, totalAnimTime);
                    });

                }, 600);
            }
        }

        // Category button handlers
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.dataset.category;
                if (cat === currentCategory) return;

                // Slide the pill
                if (cat === 'academic') {
                    categorySlider.classList.add('pos-right');
                } else {
                    categorySlider.classList.remove('pos-right');
                }

                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                switchExperienceCategory(cat);
            });
        });

        // Drag handlers (industry only)
        function handleCarouselDragStart(e) {
            if (currentCategory !== 'industry' || isCategorySwitching || isCardExpanded) return;
            isCarouselDragging = true;
            carouselStartX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            carouselCurrentX = carouselStartX;
            carouselWrapper.classList.add('dragging');
        }

        function handleCarouselDragMove(e) {
            if (!isCarouselDragging || currentCategory !== 'industry') return;
            e.preventDefault();

            carouselCurrentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
            carouselDragOffset = carouselCurrentX - carouselStartX;

            updateCarouselPositions(false);
        }

        function handleCarouselDragEnd(e) {
            if (!isCarouselDragging || currentCategory !== 'industry') return;
            isCarouselDragging = false;
            carouselWrapper.classList.remove('dragging');

            if (Math.abs(carouselDragOffset) > CAROUSEL_DRAG_THRESHOLD) {
                if (carouselDragOffset > 0) {
                    goToCarouselCard(carouselCurrentIndex - 1);
                } else {
                    goToCarouselCard(carouselCurrentIndex + 1);
                }
            } else {
                carouselDragOffset = 0;
                updateCarouselPositions(true);
            }
        }

        if (carouselWrapper) {
            carouselWrapper.addEventListener('mousedown', handleCarouselDragStart);
            document.addEventListener('mousemove', handleCarouselDragMove);
            document.addEventListener('mouseup', handleCarouselDragEnd);

            carouselWrapper.addEventListener('touchstart', handleCarouselDragStart, { passive: true });
            document.addEventListener('touchmove', handleCarouselDragMove, { passive: false });
            document.addEventListener('touchend', handleCarouselDragEnd);
        }

        // Initialize with industry carousel
        initializeExperienceCards(industryData, 'industry');
        updateCarouselPositions(false);

        // Card Morph Expansion
        // ============================================
        const cardOverlay = document.getElementById('cardOverlay');
        const expandedCard = document.getElementById('expandedCard');
        const expandedClose = document.getElementById('expandedClose');
        const expandedImage = document.getElementById('expandedImage');
        const expandedDate = document.getElementById('expandedDate');
        const expandedTitle = document.getElementById('expandedTitle');
        const expandedCompany = document.getElementById('expandedCompany');
        const expandedDescription = document.getElementById('expandedDescription');
        const expandedDetails = document.getElementById('expandedDetails');
        let activeSourceCard = null;

        // UPDATED: openCard function now accepts item data and populates unique content
        function openCard(card, itemData) {
            if (isCardExpanded || isCategorySwitching) return;
            isCardExpanded = true;
            activeSourceCard = card;

            // Get card's current screen position
            const rect = card.getBoundingClientRect();

            // Pull content from the source card
            const img = card.querySelector('.card-image');
            const date = card.querySelector('.card-date');
            const title = card.querySelector('.card-title');
            const company = card.querySelector('.card-company');
            const desc = card.querySelector('.card-description');

            expandedImage.src = img ? img.src : '';
            expandedDate.textContent = date ? date.textContent : '';
            expandedTitle.textContent = title ? title.textContent : '';
            expandedCompany.textContent = company ? company.textContent : '';
            expandedDescription.textContent = desc ? desc.textContent : '';

            // UPDATED: Populate unique responsibilities and technologies
            let detailsHTML = '';

            if (itemData.responsibilities && itemData.responsibilities.length > 0) {
                detailsHTML += '<h3 class="details-heading">Key Responsibilities</h3>';
                detailsHTML += '<ul class="details-list">';
                itemData.responsibilities.forEach(resp => {
                    detailsHTML += `<li>${resp}</li>`;
                });
                detailsHTML += '</ul>';
            }

            if (itemData.technologies && itemData.technologies.length > 0) {
                detailsHTML += '<h3 class="details-heading">Technologies</h3>';
                detailsHTML += '<div class="details-tags">';
                itemData.technologies.forEach(tech => {
                    detailsHTML += `<span class="detail-tag">${tech}</span>`;
                });
                detailsHTML += '</div>';
            }

            expandedDetails.innerHTML = detailsHTML;

            // Position expanded card exactly over the source card
            expandedCard.style.transition = 'none';
            expandedCard.style.left = rect.left + 'px';
            expandedCard.style.top = rect.top + 'px';
            expandedCard.style.width = rect.width + 'px';
            expandedCard.style.height = rect.height + 'px';
            expandedCard.style.borderRadius = '32px';
            expandedCard.style.opacity = '1';
            expandedCard.style.pointerEvents = 'auto';

            // Hide the source card
            card.style.opacity = '0';

            // Force reflow
            void expandedCard.offsetHeight;

            // Activate overlay
            cardOverlay.classList.add('active');

            // Morph to center expanded size
            requestAnimationFrame(() => {
                expandedCard.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                expandedCard.classList.add('morphing');

                // Center it
                const targetW = 680;
                const targetH = 560;
                expandedCard.style.left = ((window.innerWidth - targetW) / 2) + 'px';
                expandedCard.style.top = ((window.innerHeight - targetH) / 2) + 'px';
                expandedCard.style.width = targetW + 'px';
                expandedCard.style.height = targetH + 'px';
            });
        }

        function closeCard() {
            if (!isCardExpanded || !activeSourceCard) return;

            const rect = activeSourceCard.getBoundingClientRect();

            // Remove morphing state (hides details, close btn)
            expandedCard.classList.remove('morphing');

            // Morph back to source card position
            expandedCard.style.transition = 'all 0.45s cubic-bezier(0.4, 0, 0.2, 1)';
            expandedCard.style.left = rect.left + 'px';
            expandedCard.style.top = rect.top + 'px';
            expandedCard.style.width = rect.width + 'px';
            expandedCard.style.height = rect.height + 'px';
            expandedCard.style.borderRadius = '32px';

            // Fade overlay
            cardOverlay.classList.remove('active');

            // After morph completes, hide expanded and show source
            setTimeout(() => {
                expandedCard.style.opacity = '0';
                expandedCard.style.pointerEvents = 'none';
                activeSourceCard.style.opacity = '1';
                activeSourceCard = null;
                isCardExpanded = false;
            }, 450);
        }

        // Close button
        expandedClose.addEventListener('click', (e) => {
            e.stopPropagation();
            closeCard();
        });

        // Click on overlay background to close
        cardOverlay.addEventListener('click', (e) => {
            if (e.target === cardOverlay) {
                closeCard();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isCardExpanded) {
                closeCard();
            }
        });

        // Handle resize
        window.addEventListener('resize', () => {
            updateOverlayClipPath(currentRotation);
            if (contactDropup.classList.contains('active')) {
                positionDropup();
            }
        });