import { crearCatalogoController } from '../controllers/catalogo.controller';
import { CatalogoRepository } from '../repositories/catalogo.repository';
import { CatalogoService } from '../services/catalogo.service';
import { crearCatalogoRouter } from './catalogo.routes';

const service = new CatalogoService(new CatalogoRepository('categorias', 'id_categoria'), 'categoría');

export const categoriasRouter = crearCatalogoRouter(crearCatalogoController(service));
