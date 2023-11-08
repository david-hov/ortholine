import {
    Injectable, PipeTransform,
} from '@nestjs/common'

@Injectable()
export class TrimPipe implements PipeTransform {
    private isObj(obj: any): boolean {
        return typeof obj === 'object' && obj !== null
    }

    private trim(values) {
        Object.keys(values).forEach(key => {
            if (key === 'number' || key === 'name') {
                values[key] = values[key].trim()
            }
            if (key === 'username' || key === 'password') {
                values[key] = values[key].replace(/\s/g, '')
            }
        })
        return values
    }

    transform(values: any) {
        if (this.isObj(values)) {
            return this.trim(values)
        }
    }
}