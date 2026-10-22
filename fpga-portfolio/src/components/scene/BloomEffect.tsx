'use client';
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector2 } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export default function BloomEffect() {
  const { gl, scene, camera, size } = useThree();
  const composer = useMemo(() => {
    const effect = new EffectComposer(gl);
    effect.addPass(new RenderPass(scene, camera));
    effect.addPass(new UnrealBloomPass(new Vector2(size.width, size.height), .72, .3, 1.0));
    effect.addPass(new OutputPass());
    return effect;
  }, [gl, scene, camera, size.width, size.height]);

  useEffect(() => {
    composer.setSize(size.width, size.height);
    return () => composer.dispose();
  }, [composer, size.width, size.height]);

  useFrame((_, delta) => composer.render(delta), 1);
  return null;
}
