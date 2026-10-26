<?php

namespace App\Http\Controllers;

use Symfony\Component\HttpFoundation\Response;

class SpaController extends Controller
{
    /**
     * Serve the built SPA shell, or a setup hint when the build is missing.
     */
    public function __invoke(): Response
    {
        $shell = public_path('spa/index.html');

        if (! file_exists($shell)) {
            return response(
                'Frontend build not found. Run `npm run build` in frontend/.',
                200,
                ['Content-Type' => 'text/plain'],
            );
        }

        return response()->file($shell);
    }
}
