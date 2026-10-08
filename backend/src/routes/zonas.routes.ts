import { crearCatalogoController } from '../controllers/catalogo.controller';
import { CatalogoRepository } from '../repositories/catalogo.repository';
import { CatalogoService } from '../services/catalogo.service';
import { crearCatalogoRouter } from './catalogo.routes';

const service = new CatalogoService(new CatalogoRepository('zonas', 'id_zona'), 'zona');

export const zonasRouter = crearCatalogoRouter(crearCatalogoController(service));
