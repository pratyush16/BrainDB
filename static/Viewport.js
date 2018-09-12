function Viewport (container)
{
    var camera, scene, renderer, controls, light,
        binaryLoader = new THREE.BinaryLoader (true),
        elements = [],
        labels = [],
        pathway, spline,
        resetCamera = function () {},
        playTime, playFastFraction = 0.20, playLength = 90.0;

    scene = new THREE.Scene ();

    scene.add (new THREE.AmbientLight (0x404040));

    light = new THREE.DirectionalLight (0xffffff);
    scene.add (light);

    camera = new THREE.PerspectiveCamera (75, container.width () / container.height (), 1, 10000);
    camera.position.set (0, -300, 1500);
    camera.up.set (0, 0, 1);

    controls = new THREE.TrackballControls (camera, container[0]);
    controls.target.set (0, -100, 1500);
    controls.addEventListener ('change', updateLightPosition);
    updateLightPosition ();

    renderer = new THREE.WebGLRenderer ({ antialias: true });
    renderer.setClearColor ($('body').css ('background-color'));
    renderer.setSize (container.width (), container.height ());

    container.append (renderer.domElement);

    window.addEventListener ('resize', onWindowResize, false);

    var prevTimestamp = 0;

    (function animate (timestamp)
    {
        if (timestamp)
        {
            var delta = (timestamp - prevTimestamp) / 1000;
            prevTimestamp = timestamp;

            if (hollowFacePlayTime !== undefined)
            {
                hollowFacePlayTime += delta * 0.2;
                face.quaternion.setFromAxisAngle (new THREE.Vector3 (0, 0, 1), hollowFacePlayTime);
            }

            if (playTime !== undefined)
            {
                playTime += delta;

                if (playTime >= playLength)
                {
                    endAnimation ();
                }
                else
                {
                    var t;
                    if (playTime < (playFastFraction * playLength))
                    {
                        t =  playTime / (playFastFraction * playLength) * (1 - playFastFraction);
                    }
                    else
                    {
                        t = (playTime - (playFastFraction * playLength)) / ((1 - playFastFraction) * playLength)
                            * playFastFraction + (1 - playFastFraction);
                    }
                    var pos = spline.getPointAt (t);
                    var dir = spline.getTangentAt (t);
                    camera.position.set (pos.x, pos.y, pos.z);
                    camera.lookAt (pos.add (dir));
                    controls.target.set (pos.x, pos.y, pos.z);

                    updateLightPosition ();
                }
            }
            else
            {
                controls.update ();
            }
        }

        renderer.render (scene, camera);

        var frustum = new THREE.Frustum ();
        frustum.setFromMatrix (new THREE.Matrix4 ().multiplyMatrices (camera.projectionMatrix, camera.matrixWorldInverse));

        labels.forEach (function (label)
        {
            if (frustum.containsPoint (label.pos))
            {
                label.obj.show ();
                var v2 = to2d (label.pos);
                label.obj.css ('left', v2.x + 'px');
                label.obj.css ('top',  v2.y + 'px');
            }
            else
            {
                label.obj.hide ();
            }
        });

        requestAnimationFrame (animate);
    }) ();

    this.show = function (concept)
    {
        concept.fileIds.forEach (function (fileId)
        {
            if (!elements[fileId])
                elements[fileId] = {};

            elements[fileId].loaded = true;
            elements[fileId].transparent = concept.transparent;

            updateElement (fileId);
        });
    }

    this.showB = function (concept)
    {
        concept.fileIds.forEach (function (fileId)
        {
            if (!elements[fileId])
                elements[fileId] = {};

            elements[fileId].loaded = true;
            elements[fileId].transparent = concept.transparent;

            updateElementB (fileId);
        });
    }

    this.select = function (concept)
    {
        concept.fileIds.forEach (function (fileId)
        {
            if (!elements[fileId])
                elements[fileId] = {};

            elements[fileId].selected = true;

            updateElement (fileId);
        });
    }

    this.hide = function (concept)
    {
        concept.fileIds.forEach (function (fileId)
        {
            if (elements[fileId])
            {
                elements[fileId].loaded = false;

                if (!elements[fileId].selected)
                {
                    elements[fileId].transparent = false;
                    scene.remove (elements[fileId].mesh);
                }
            }
        });
    }

    this.deselect = function (concept)
    {
        concept.fileIds.forEach (function (fileId)
        {
            var element = elements[fileId];
            if (element)
            {
                element.selected = false;

                scene.remove (element.mesh);

                if (element.mesh && element.loaded)
                {
                    updateMesh (element);
                    scene.add (element.mesh);
                }
                else
                {
                    element.transparent = false;
                }
            }
        });
    }

    var face, hollowFacePlayTime;
    this.hollowFaceStart = function ()
    {
        binaryLoader.load ('data/bin/face.js', function (geometry, material)
        {
            camera.position.set (0, -300, 1500);
            geometry.computeVertexNormals ();
            face = new THREE.Mesh (geometry, new THREE.MeshLambertMaterial ({ color: 0x777777 }));
            scene.add (face);
            hollowFacePlayTime = -1;
        });
    }

    this.hollowFaceStop = function ()
    {
        hollowFacePlayTime = undefined;
        scene.remove (face);
    }

    function onWindowResize ()
    {
        camera.aspect = container.width () / container.height ();
        camera.updateProjectionMatrix ();

        renderer.setSize (container.width (), container.height ());
    }

    function pathwayClear ()
    {
        if (pathway)
        {
            scene.remove (pathway);
            pathway.geometry.dispose ();
            pathway.material.dispose ();
            pathway = undefined;
        }
    }

    function labelsClear ()
    {
        labels.forEach (function (label) { label.obj.remove (); });
        labels = [];
    }

    function to2d (vec3d)
    {
        var vector = vec3d.clone ().project (camera);
        vector.x =  (vector.x + 1) / 2 * container.width ();
        vector.y = -(vector.y - 1) / 2 * container.height ();
        return vector;
    }

    function addLabels ()
    {
        labels.forEach (function (label)
        {
            container.append (label.obj);
            if      (label.obj.hasClass ('text3dX')) { label.obj.css ('margin', '-' + label.obj.outerHeight () + 'px 0 0 -' + label.obj.outerWidth () + 'px'); }
            else if (label.obj.hasClass ('text3dL')) { label.obj.css ('margin', '0 0 0 -' + label.obj.outerWidth () + 'px'); }
            else if (label.obj.hasClass ('text3dT')) { label.obj.css ('margin', '-' + label.obj.outerHeight () + 'px 0 0 0'); }
        });
    }

    function updateLightPosition ()
    {
        light.position.copy (camera.position);
        light.target.position.copy (controls.target);
        light.target.updateMatrixWorld ();
    };

    function updateElement (fileId)
    {
        if (elements[fileId].mesh)
        {
            scene.remove (elements[fileId].mesh);
            updateMesh (elements[fileId]);
            scene.add (elements[fileId].mesh);
        }
        else
        {
            var fileUrl = 'data/bin/' + fileId + '.js';
            $.ajax ({ url: fileUrl, type: 'HEAD' }).done (function ()
            {
                binaryLoader.load (fileUrl, function (geometry, material)
                {
                    if (elements[fileId].mesh)
                        geometry.dispose ();
                    else
                        elements[fileId].mesh = new THREE.Mesh (geometry, new THREE.MeshLambertMaterial ());

                    updateMesh (elements[fileId]);
                    scene.add (elements[fileId].mesh);
                });
            });
        }
    }

    function updateElementB (fileId)
    {
        if (elements[fileId].mesh)
        {
            scene.remove (elements[fileId].mesh);
            updateMeshB (elements[fileId]);
            scene.add (elements[fileId].mesh);
        }
        else
        {
            var fileUrl = 'data/bin/' + fileId + '.js';
            $.ajax ({ url: fileUrl, type: 'HEAD' }).done (function ()
            {
                binaryLoader.load (fileUrl, function (geometry, material)
                {
                    if (elements[fileId].mesh)
                        geometry.dispose ();
                    else
                        elements[fileId].mesh = new THREE.Mesh (geometry, new THREE.MeshLambertMaterial ());

                    updateMesh (elements[fileId]);
                    scene.add (elements[fileId].mesh);
                });
            });
        }
    }

    function updateMesh (element)
    {
        if (element.selected)
        {
            element.mesh.material.setValues ({ color: 0xBB9900 });
            element.mesh.material.setValues ({ transparent: false, depthWrite: true });
        }
        else
        {
            element.mesh.material.setValues ({ color: 0x777777 });
            if (element.transparent)
            {
                element.mesh.material.setValues ({ transparent: true, opacity: 0.3, depthWrite: false });
            }
            else
            {
                element.mesh.material.setValues ({ transparent: false, depthWrite: true });
            }
        }
    }

    function updateMeshB (element)
    {
        element.mesh.material.setValues ({ color: 0x0000FF });
        element.mesh.material.setValues ({ transparent: false, depthWrite: true });
    }
}
