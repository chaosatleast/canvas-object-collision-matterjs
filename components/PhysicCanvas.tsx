"use client";

import Matter, { IEvent, MouseConstraint } from "matter-js";
import p5 from "p5";
import React, { useEffect } from "react";

interface ICustomMouse extends IEvent<MouseConstraint> {
    body: Matter.Body;
}

// * Constants for boundaries height
const BOUNDARY_HEIGHT = 50;

// * Constants for the initial radius
const INITIAL_RADIUS = 50;

// * Constants content for the circles
const contents = [
    "Layout",
    "React",
    "CSS",
    "JavaScript",
    "Designer",
    "State \n Management",
    "Responsive",
    '"Very Easy" \n Task',
    "Project Size",
    "Laggy \n Performance",
    "Legacy Code",
    "TypeScript \n Type",
];

function PhysicCanvas() {
    const canvasRef = React.useRef<HTMLDivElement | null>(null);

    // * Create boundaries function
    function createBoundaries() {
        if (!canvasRef.current) return;

        const { clientWidth, clientHeight } = canvasRef.current;
        // * Ceiling
        const boundaries = [
            Matter.Bodies.rectangle(
                clientWidth / 2,
                0,
                clientWidth,
                BOUNDARY_HEIGHT,
                { isStatic: true, restitution: 0.0, label: "boundary" }, // Added label
            ),
            // * Ground
            Matter.Bodies.rectangle(
                clientWidth / 2,
                clientHeight,
                clientWidth,
                BOUNDARY_HEIGHT,
                { isStatic: true, restitution: 0.0, label: "boundary" }, // Added label
            ),
            Matter.Bodies.rectangle(
                0,
                clientHeight / 2,
                BOUNDARY_HEIGHT,
                clientHeight,
                { isStatic: true, restitution: 0.0, label: "boundary" }, // Added label
            ),
            Matter.Bodies.rectangle(
                clientWidth,
                clientHeight / 2,
                BOUNDARY_HEIGHT,
                clientHeight,
                { isStatic: true, restitution: 0.0, label: "boundary" }, // Added label
            ),
        ];

        return boundaries;
    }

    // * Create single circle
    function createSingleCircle(x: number, y: number, radius: number) {
        const atom = Matter.Bodies.circle(
            x,
            y,
            radius, // Increased radius from 20 to 50
            {
                label: "circle", // Added label
                restitution: 1,
                frictionAir: 0.01,
                friction: 0,
                density: 1,
                render: {
                    fillStyle: "red",
                },
            },
        );
        return atom;
    }

    // * Create circles
    function createCircles() {
        if (!canvasRef.current) return;
        const { clientHeight, clientWidth } = canvasRef.current;

        const circles: Matter.Body[] = [];

        contents.forEach((content, index) => {
            // * Random x position
            const x =
                (index + 1) % 2 === 0
                    ? Math.random() * (clientWidth - INITIAL_RADIUS * 2) +
                      INITIAL_RADIUS
                    : Math.random() * (clientWidth - INITIAL_RADIUS * 2) +
                      INITIAL_RADIUS;

            // * Random y position
            const y =
                Math.random() * (clientHeight - INITIAL_RADIUS * 2) +
                INITIAL_RADIUS;

            const atom = createSingleCircle(x, y, INITIAL_RADIUS);
            circles.push(atom);
        });

        return circles;
    }

    // * Perform boundaries checking
    function boundariesChecking(body: Matter.Body, radius: number) {
        if (!canvasRef.current) return;
        const { clientWidth, clientHeight } = canvasRef.current;

        const { x, y } = body.position;

        const clampedX = Math.max(radius, Math.min(clientWidth - radius, x));
        const clampedY = Math.max(radius, Math.min(clientHeight - radius, y));

        const maxSpeed = 10;
        const velocity = body.velocity;

        // * Check the magnitude (speed) of the velocity vector using Pythagorean theorem of the body
        const speed = Math.sqrt(
            Math.pow(velocity.x, 2) + Math.pow(velocity.y, 2),
        );
        if (speed > maxSpeed) {
            Matter.Body.setVelocity(body, {
                x: (velocity.x / speed) * maxSpeed,
                y: (velocity.y / speed) * maxSpeed,
            });
        }
        if (x !== clampedX || y !== clampedY) {
            Matter.Body.setPosition(body, {
                x: clampedX,
                y: clampedY,
            });
        }
    }

    // function boundariesForPillChecking(body: Matter.Body) {
    //     if (!canvasRef.current) return;
    //     const { clientWidth, clientHeight } = canvasRef.current;
    //     const minX = BOUNDARY_HEIGHT;
    //     const maxX = clientWidth - BOUNDARY_HEIGHT;
    //     const minY = BOUNDARY_HEIGHT;
    //     const maxY = clientHeight - BOUNDARY_HEIGHT;

    //     let { x, y } = body.position;
    //     let { x: vx, y: vy } = body.velocity;

    //     // *Correct position and velocity when out of bounds horizontally
    //     if (x < minX) {
    //         x = minX;
    //         vx = Math.abs(vx); // * Reverse velocity to keep it within bounds
    //     } else if (x > maxX) {
    //         x = maxX;
    //         vx = -Math.abs(vx); // * Reverse velocity to keep it within bounds
    //     }

    //     // * Correct position and velocity when out of bounds vertically
    //     if (y < minY) {
    //         y = minY;
    //         vy = Math.abs(vy); // * Reverse velocity to keep it within bounds
    //     } else if (y > maxY) {
    //         y = maxY;
    //         vy = -Math.abs(vy); // * Reverse velocity to keep it within bounds
    //     }
    //     // * Set the corrected position and velocity
    //     Matter.Body.setVelocity(body, { x: vx, y: vy });
    //     Matter.Body.setPosition(body, { x, y });
    // }

    useEffect(() => {
        if (!canvasRef.current) return;
        const { clientWidth, clientHeight } = canvasRef.current;

        const circleArray: Matter.Body[] = [];

        // * Create engine
        const engine = Matter.Engine.create({});

        // * Create boundaries
        const boundaries = createBoundaries();
        if (!boundaries) return;
        // * Add boundaries to the world
        Matter.World.add(engine.world, boundaries);

        // * Create circles
        const circles = createCircles();
        if (!circles) return;
        // * Add circles to the world
        circleArray.push(...circles);
        Matter.World.add(engine.world, circles);

        // // * Create renderer
        // const render = Matter.Render.create({
        //     element: canvasRef.current,
        //     engine: engine,
        //     options: {
        //         width: clientWidth,
        //         height: clientHeight,
        //         wireframes: false,
        //         background: "transparent",
        //     },
        // });
        // Matter.Render.run(render);

        // *Add runner
        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, engine);

        // * Create Mouse Constraint
        const mouse = Matter.Mouse.create(canvasRef.current);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false,
                },
            },
        });

        Matter.World.add(engine.world, mouseConstraint);

        // *Track the currently dragged body
        let draggedBody: Matter.Body | null = null;

        // *Start drag event , Scale up the dragged body
        Matter.Events.on(mouseConstraint, "startdrag", (event) => {
            const e = event as ICustomMouse;

            if (circleArray.includes(e.body)) {
                draggedBody = e.body;
                Matter.Body.scale(draggedBody, 2, 2);
            }
        });

        // *Stop drag event , Scale down the dragged body
        Matter.Events.on(mouseConstraint, "enddrag", (event) => {
            const e = event as ICustomMouse;
            if (draggedBody === e.body) {
                Matter.Body.scale(draggedBody, 0.5, 0.5);
                draggedBody = null;
            }
        });

        // * Perform boundaries check to every circle bodies including the dragged body on every update
        Matter.Events.on(engine, "beforeUpdate", () => {
            circleArray.forEach((circle) =>
                boundariesChecking(circle, INITIAL_RADIUS),
            );

            if (draggedBody) {
                boundariesChecking(draggedBody, INITIAL_RADIUS * 2);
            }
        });

        // * Mouse leave and enter events
        canvasRef.current.addEventListener("mouseleave", () => {
            if (draggedBody) {
                // * Scale down the dragged body
                Matter.Body.scale(draggedBody, 0.5, 0.5);

                // * Reset the dragged body position
                const boundingX =
                    draggedBody.bounds.max.x - draggedBody.bounds.min.x;
                const boundingY =
                    draggedBody.bounds.max.y - draggedBody.bounds.min.y;

                Matter.Body.setPosition(draggedBody, {
                    x: boundingX,
                    y: boundingY,
                });

                // * Reset the dragged body to null
                draggedBody = null;

                // * Set the mouse button to -1, deactivating the mouse event to the canvas
                mouseConstraint.mouse.button = -1;
            }
        });

        const p5Instance = new p5((p5) => {
            p5.setup = () => {
                p5.createCanvas(clientWidth, clientHeight);
            };

            p5.draw = () => {
                p5.background("#0d0d0d");

                // * Index for the contents
                let index = 0;

                // * Draw the circle bodies
                Matter.Composite.allBodies(engine.world).forEach((body) => {
                    if (body.label === "circle" && index < contents.length) {
                        if (draggedBody === body && body.circleRadius) {
                            p5.fill("#E3FF00");
                            p5.noStroke();
                            p5.ellipse(
                                body.position.x,
                                body.position.y,
                                body.circleRadius * 2,
                            );
                        }
                        if (body.circleRadius && draggedBody !== body) {
                            p5.fill("#f2f1f0");
                            p5.noStroke();
                            p5.ellipse(
                                body.position.x,
                                body.position.y,
                                body.circleRadius * 2,
                            );
                        }

                        p5.textAlign(p5.CENTER, p5.CENTER);
                        p5.fill("#0d0d0d");
                        p5.textSize(15);
                        p5.noStroke();

                        p5.text(
                            contents[index++],
                            body.position.x,
                            body.position.y,
                        );

                        if (index === contents.length - 1) {
                            index = 0;
                        }
                    }
                });
            };

            p5.windowResized = () => {
                if (!canvasRef.current) return;
                const { clientWidth, clientHeight } = canvasRef.current;
                p5.resizeCanvas(clientWidth, clientHeight);
            };
        }, canvasRef.current);

        // * Handle the window resize event
        function handleResize() {
            // * Clear the matter.js world
            Matter.Composite.clear(engine.world, false);

            // * Recreate the boundaries based on the new client width and height
            const boundaries = createBoundaries();
            if (!boundaries) return;
            Matter.World.add(engine.world, boundaries);

            circleArray.length = 0;
            const circles = createCircles();
            if (!circles) return;
            circleArray.push(...circles);
            Matter.World.add(engine.world, circles);

            const mouseConstraint = Matter.MouseConstraint.create(engine, {
                mouse: mouse,
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false,
                    },
                },
            });
            Matter.World.add(engine.world, mouseConstraint);
        }

        window.addEventListener("resize", handleResize);

        return () => {
            // * Clean up function to remove the canvas
            p5Instance.remove();

            // * Remove the event listener
            window.removeEventListener("resize", handleResize);

            // * Clear the render canvas
            // if (render.canvas && render.canvas.parentNode) {
            //     render.canvas.parentNode.removeChild(render.canvas);
            // }
        };
    }, []);
    return <div className="h-full w-full" ref={canvasRef}></div>;
}

export default PhysicCanvas;
