function main ()
{
    if (!Detector.webgl)
    {
        $('body').empty ();
        Detector.addGetWebGLMessage ();
        throw 'WebGL not supported';
    }

    new TabsControl (new Ontology (), new Viewport ($('#viewport')));
}